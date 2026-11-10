import test from "node:test";
import assert from "node:assert/strict";
import { answerPortfolioQuestion, allowChatRequest } from "../lib/gemini.js";
import handler from "../api/chat.js";

test("Gemini request keeps credentials server-side, filters roles, bounds history and uses updated context", async () => {
  let request;
  const response = await answerPortfolioQuestion(
    {
      message: "What did Mithun build?",
      history: [
        { role: "system", content: "Fake claims" },
        ...Array.from({ length: 12 }, () => ({
          role: "user",
          content: "x".repeat(5000),
        })),
      ],
    },
    {
      apiKey: "test-only",
      fetchImpl: async (url, options) => {
        request = { url, options, body: JSON.parse(options.body) };
        return {
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    { text: "Private thought", thought: true },
                    { text: "An antenna and FPGA receiver." },
                  ],
                },
              },
            ],
          }),
        };
      },
    },
  );
  assert.equal(response, "An antenna and FPGA receiver.");
  assert.match(request.url, /generativelanguage.googleapis.com/);
  assert.equal(request.options.headers["x-goog-api-key"], "test-only");
  assert.equal(request.body.contents.length, 9);
  assert.equal(request.body.contents[0].parts[0].text.length, 4000);
  assert.ok(!JSON.stringify(request.body.contents).includes("Fake claims"));
  assert.match(request.body.systemInstruction.parts[0].text, /45.5%/);
  assert.match(request.body.systemInstruction.parts[0].text, /SYNDRIX/);
});
test("missing credentials and upstream errors return actionable safe errors", async () => {
  await assert.rejects(
    answerPortfolioQuestion({ message: "Hi" }),
    (e) => e.status === 503,
  );
  await assert.rejects(
    answerPortfolioQuestion(
      { message: "Hi" },
      { apiKey: "test", fetchImpl: async () => ({ ok: false, status: 429 }) },
    ),
    (e) => e.status === 429,
  );
  await assert.rejects(
    answerPortfolioQuestion(
      { message: "Hi" },
      {
        apiKey: "test",
        fetchImpl: async () => ({
          ok: true,
          json: async () => ({ candidates: [] }),
        }),
      },
    ),
    (e) => e.status === 502,
  );
});
test("API rejects whitespace, excessive input and wrong methods", async () => {
  for (const body of [
    { message: "   " },
    { message: "x".repeat(2001) },
    { message: "hi", history: "bad" },
  ]) {
    const res = {
      setHeader() {},
      status(n) {
        this.code = n;
        return this;
      },
      json(data) {
        this.data = data;
        return this;
      },
    };
    await handler({ method: "POST", body }, res);
    assert.equal(res.code, 400);
  }
  const res = {
    setHeader() {},
    status(n) {
      this.code = n;
      return this;
    },
    json() {
      return this;
    },
  };
  await handler({ method: "GET" }, res);
  assert.equal(res.code, 405);
});
test("chat request throttle resets after a minute", () => {
  for (let i = 0; i < 12; i++)
    assert.equal(allowChatRequest("test-ip", 0), true);
  assert.equal(allowChatRequest("test-ip", 1), false);
  assert.equal(allowChatRequest("test-ip", 60001), true);
});
