export const portfolioKnowledge = {
  personal: {
    name: "Mithun Kumar J",
    role: "Electronics and Communication Engineering undergraduate at VIT Chennai",
    location: "Chennai, India",
    about: "Mithun builds embedded systems, FPGA prototypes, RF simulations, and engineering tools for circuit design and review."
  },
  education: {
    degree: "B.Tech. in Electronics and Communication Engineering",
    institution: "VIT Chennai",
    batch: "2024–2028",
    coursework: ["VLSI design", "Microprocessors and microcontrollers", "Analog communication", "Digital signal processing"]
  },
  skills: {
    hardware: ["ARM Cortex-M", "Embedded C", "ESP32", "Raspberry Pi", "KiCad PCB design", "UART, SPI, I2C, and CAN", "Sensor integration"],
    fpgaAndRf: ["Verilog HDL", "Vivado and Vitis", "Zynq-7000", "Dynamic partial reconfiguration", "CST Studio Suite", "openEMS", "RF and antenna simulation", "Cadence Virtuoso", "LTspice"],
    software: ["C and C++", "Python", "JavaScript and TypeScript", "React", "Node.js", "FastAPI and Flask", "Supabase and Firebase", "MQTT", "n8n", "Git and Linux"],
    ai: ["Schematic OCR", "Computer vision", "OpenCV", "YOLOv8", "Random Forest", "Gemini API"]
  },
  projects: [
    {
      title: "DeCad",
      aliases: ["schematic ocr", "schematic to cad", "scanned schematics"],
      featured: true,
      description: "A local workspace that converts scanned schematics into reviewable circuit designs. Users inspect recognized components and pin connections against the source before exporting to CAD.",
      repo: "https://github.com/Mithunjagan/DeCad"
    },
    {
      title: "Prompt2CST",
      aliases: ["prompt to cst", "rf simulation workspace"],
      featured: true,
      description: "A local-first antenna design workspace with openEMS simulation and an optional, approval-gated workflow for creating geometry in CST Studio Suite 2026.",
      repo: "https://github.com/Mithunjagan/Prompt2CST"
    },
    {
      title: "LDACS on Zynq",
      aliases: ["ldacs", "dynamic partial reconfiguration", "zynq receiver"],
      featured: true,
      description: "An FPGA receiver study on the Zynq-7010 comparing processing-system, programmable-logic, hybrid, and dynamic partial reconfiguration architectures. The repo includes physical-board measurements for eight coding profiles across four architectures.",
      repo: "https://github.com/Mithunjagan/Dynamic-Partial-Reconfiguration_LDACS"
    },
    {
      title: "Smart-Glasses Antenna",
      aliases: ["smart glasses", "wearable antenna", "2.45 ghz", "dipole", "sar"],
      featured: true,
      description: "A 50 × 6 mm printed dipole simulated at 2.45 GHz in free space and beside a layered head model. The repository contains CST projects, S-parameters, radiation results, and SAR exports. The evidence is simulation only.",
      repo: "https://github.com/Mithunjagan/Antenna-for-Smart-Glasses-2.45-GHz-"
    },
    {
      title: "SuperRR",
      aliases: ["rajasthan royals", "scouting dashboard", "super rr"],
      description: "A Rajasthan Royals scouting dashboard and dossier for SupeRR Selector Round 1, covering pressure performance, ranking robustness, and auction scenarios.",
      repo: "https://github.com/Mithunjagan/SuperRR"
    },
    {
      title: "Crypto Pigeon",
      aliases: ["crypto pigeon", "encrypted messaging", "tor messaging"],
      description: "An unaudited private-beta messaging app for Android and Windows using the Signal protocol, local encrypted storage, and direct Tor connections.",
      repo: "https://github.com/Mithunjagan/Crypto-pigeon"
    },
    {
      title: "AKVO",
      aliases: ["akvosphere", "awg", "water generator", "water generation"],
      description: "An atmospheric water generator control and monitoring system with Raspberry Pi edge sensing, relay automation, and fleet telemetry using FastAPI and Supabase.",
      repo: "https://github.com/Mithunjagan/AKVO-intern"
    },
    {
      title: "Smart Classroom IoT",
      aliases: ["smart classroom", "classroom monitoring", "wearable biometrics"],
      description: "A wearable and Raspberry Pi gateway prototype that sends biometric and motion readings to Firebase for a React monitoring dashboard."
    },
    {
      title: "Smart Attendance System",
      aliases: ["smart attendance", "rfid", "face verification"],
      description: "A prototype combining RFID and face verification with automated attendance logging and alerts. The linked repository documents the RFID-to-Google-Sheets logger.",
      repo: "https://github.com/Mithunjagan/RFID"
    },
    {
      title: "Ship Spy Live",
      aliases: ["shipspy", "ship spy", "vessel detection"],
      description: "A computer vision project that classifies vessels from camera feeds and displays detections in a maritime dashboard.",
      repo: "https://github.com/Mithunjagan/ship-spy-live"
    }
  ],
  experience: [
    {
      organization: "Akvosphere",
      role: "Embedded Electronics & Automation Engineering Intern",
      period: "2026",
      details: "Worked on KiCad schematics, ESP32 and Raspberry Pi control, hardware failover, telemetry, and workflow automation for atmospheric water generators."
    },
    {
      organization: "MEDxAI Innovations Private Limited",
      role: "Embedded Electronics Engineering Intern",
      period: "Jun 2025 – Sep 2025",
      details: "Prototyped an intoxication-detection system combining voice features and breath-alcohol sensor readings with an IoT alert pipeline."
    },
    {
      organization: "IEEE Robotics and Automation Society, VIT Chennai",
      role: "Technical Team Member",
      period: "Joined Aug 2024",
      details: "Contributed to robotics prototyping, debugging, and hardware/software integration."
    },
    {
      organization: "Shaurya Racing",
      role: "Technical Team Member",
      period: "Feb 2025 – Apr 2026",
      details: "Contributed to electric-vehicle telemetry interfaces and studied drivetrain integration and battery power draw."
    }
  ],
  achievements: [
    "Robo Soccer finalist at IIT Madras Shaastra",
    "Smart India Hackathon top-50 team selection, as listed on the resume",
    "NVIDIA Deep Learning Institute Generative AI training",
    "Microchip University ARM-M architecture training"
  ],
  contact: {
    email: "mithunkumarjagan@gmail.com",
    github: "https://github.com/Mithunjagan",
    linkedin: "https://www.linkedin.com/in/mithun-kumar-j/"
  }
};
