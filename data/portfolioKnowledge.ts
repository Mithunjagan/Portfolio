export const portfolioKnowledge = {
  personal: {
    name: "Mithun Kumar J",
    role: "Founder of SYNDRIX; third-year ECE undergraduate at VIT Chennai (2026)",
    location: "Chennai, India",
  },
  education: {
    degree: "B.Tech in Electronics and Communication Engineering",
    institution: "VIT Chennai",
    years: "2024–2028",
    expectedGraduation: 2028,
    focusAreas: [
      "Embedded Systems",
      "Digital Hardware Design",
      "FPGA",
      "VLSI",
      "RF Engineering",
      "Edge AI",
    ],
  },
  experience: [
    {
      company: "SYNDRIX",
      role: "Founder",
      description:
        "Electronics and embedded-systems venture focused on PCB design, firmware, IoT solutions, prototyping, and software integration.",
      period: "APR 2026–PRESENT",
    },
    {
      company: "AKVO ATMOSPHERIC WATER SYSTEMS",
      role: "Embedded Systems & IoT Intern",
      description:
        "Raspberry Pi-based AWG control, sensor integration, finite-state-machine automation, FastAPI, Supabase cloud telemetry, and fault handling.",
      period: "2026",
    },
    {
      company: "SHAURYA RACING · VIT CHENNAI",
      role: "Electronics Team Member",
      description:
        "Formula EV electronics, ESP32-based CAN telemetry, sensor interfaces, and hardware integration.",
      period: "FORMULA EV",
    },
    {
      company: "IEEE ROBOTICS & AUTOMATION SOCIETY",
      role: "Member",
      description:
        "Part of the robotics and automation community at VIT Chennai.",
      period: "VIT CHENNAI",
    },
  ],
  projects: [
    {
      id: "rf-0",
      github:
        "https://github.com/Mithunjagan/Antenna-for-Smart-Glasses-2.45-GHz-",
      title: "SMART GLASSES / RF ENGINEERING",
      description:
        "A compact 2.45 GHz planar dipole antenna designed and simulated for smart glasses. Evaluated impedance matching, radiation performance, and human-head interaction.",
      results:
        "−18.8 dB S11 · 45.5% radiation efficiency in on-head simulation",
      technologies: ["RF engineering", "Antenna simulation", "2.45 GHz"],
      status: "SIMULATED & EVALUATED",
    },
    {
      id: "digital-1",
      github:
        "https://github.com/Mithunjagan/Dynamic-Partial-Reconfiguration_LDACS",
      title: "LDACS / FPGA RECEIVER",
      description:
        "Implemented and verified an LDACS receiver decoding architecture on Xilinx Vivado and Zynq-7000, including channel estimation, equalization, and PS/PL integration.",
      results: "9 verification cases completed · Timing met",
      technologies: ["FPGA", "Vivado", "Zynq-7000"],
      status: "IMPLEMENTED & VERIFIED",
    },
    {
      id: "embedded-2",
      title: "AKVO / ATMOSPHERIC WATER SYSTEMS",
      description:
        "Raspberry Pi/Linux control software integrating temperature, humidity, water-flow, and tank-level sensors. Finite-state-machine automation, fault handling, and cloud telemetry.",
      results: "Sensors → State machine → Actuators → Cloud",
      technologies: ["Python", "FastAPI", "Supabase", "Raspberry Pi"],
      status: "DEVELOPED",
      github: "https://github.com/Mithunjagan/AKVO-intern",
    },
    {
      id: "embedded-3",
      title: "WEARABLE / FOUR-LAYER HARDWARE",
      description:
        "A four-layer STM32 wearable PCB in KiCad, bringing GPS, power distribution, and RF-aware routing into a compact hardware design.",
      results: "4-layer PCB · STM32 · GPS · RF-aware routing",
      technologies: ["KiCad", "STM32", "PCB design"],
      status: "DESIGNED",
    },
  ],
  ongoing: [
    {
      title: "RTL Verification & AI Accelerator",
      status: "Ongoing learning and development",
      description:
        "Learning Verilog RTL design, simulation, testbench development, sequential logic, and hardware verification. Working toward an INT8 MAC accelerator and eventual ASIC-oriented flow; not a completed accelerator.",
    },
  ],
  additionalProjects: [
    {
      title: "ESP32 Antenna in CST",
      description: "ESP32 antenna design and simulation in CST Studio Suite.",
      github: "https://github.com/Mithunjagan/ESP-antenna",
    },
    {
      title: "Robo Soccer Striker",
      description:
        "ESP32, ESP-NOW, motor drivers, custom wireless drive controls",
    },
    {
      title: "DECAD",
      description: "Schematic OCR and circuit reconstruction",
    },
    {
      title: "RFID Attendance System",
      description: "ESP32, RC522, Python, Google Sheets",
    },
    {
      title: "FineHands",
      description: "Financial document analysis using OCR, ML, and Supabase",
    },
    {
      title: "Ship Spy Live",
      description: "YOLO-based vessel detection and monitoring",
    },
    {
      title: "Delta Modulation FPGA",
      description: "ZedBoard encoder and decoder",
    },
  ],
  achievements: [
    "Smart India Hackathon 2026 — Internal Round Top 50 among approximately 1,700 participating teams at VIT Chennai. Not a national Top 50 result.",
    "IIT Madras Shaastra Robo Soccer opening-round winner and finalist, Team GOAL GORITHM",
    "Participated in six or more hackathons",
  ],
  contact: {
    email: "mithunkumarjagan@gmail.com",
    github: "https://github.com/Mithunjagan",
    linkedin: "https://www.linkedin.com/in/mithun-kumar-j/",
  },
};
