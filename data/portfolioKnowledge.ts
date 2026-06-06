export const portfolioKnowledge = {
  personal: {
    name: "Mithun",
    role: "Electronics and Communication Engineering Student & Developer",
    about: "An Electronics and Communication Engineering (ECE) student passionate about Embedded Systems, ARM Architecture, AI, Computer Vision, and Electronics Design. Mithun specializes in bridging hardware specifications and software intelligence to build functional, high-performance engineering projects.",
    interests: [
      "Embedded Systems",
      "ARM Architecture",
      "Artificial Intelligence (AI)",
      "Computer Vision",
      "Electronics Design & PCB Development"
    ]
  },
  education: {
    degree: "Bachelor of Technology in Electronics and Communication Engineering",
    institution: "Technical University",
    status: "Ongoing Student",
    relevantCourses: [
      "Microprocessors and Microcontrollers",
      "Embedded System Design",
      "Digital Signal Processing",
      "VLSI Design & Computer Architecture",
      "Signals and Systems",
      "Object-Oriented Programming"
    ]
  },
  skills: {
    hardware: [
      "ARM Cortex-M (STM32)",
      "ESP32 & Arduino Platforms",
      "PCB Design & Layout (Altium, KiCad)",
      "Communication Protocols (SPI, I2C, UART, CAN)",
      "Hardware Debugging & Oscilloscopes"
    ],
    software: [
      "Languages: C, C++, Python, JavaScript, TypeScript, HTML/CSS",
      "AI & CV: OpenCV, PyTorch, TensorFlow Lite, MediaPipe",
      "Embedded: RTOS (FreeRTOS), Bare-Metal programming"
    ],
    tools: [
      "Git & GitHub",
      "Linux environment",
      "Docker",
      "VS Code & STM32CubeIDE",
      "MATLAB & Simulink"
    ]
  },
  projects: [
    {
      id: "ship-spy-live",
      title: "Ship Spy Live",
      description: "An AI-powered maritime surveillance system that uses real-time computer vision to detect, classify, and track marine vessels from live camera feeds and satellite imagery. Designed for edge execution, enabling low-latency tracking of maritime activity.",
      technologies: ["Python", "PyTorch", "OpenCV", "YOLOv8", "Docker", "Streamlit"],
      keyFeatures: [
        "Real-time vessel detection & classification (cargo, tanker, passenger, military, etc.)",
        "Edge-compatible deployment optimizing inference speeds on low-power devices",
        "Interactive dashboard mapping vessel trajectories and historical traffic trends"
      ]
    },
    {
      id: "embedded-rtos-kernel",
      title: "Embedded Real-Time OS (RTOS) Kernel",
      description: "A custom preemptive RTOS kernel built from scratch for ARM Cortex-M4 microcontrollers (STM32F4). Includes priority-based scheduling, mutexes, semaphores, and inter-process communication features.",
      technologies: ["C", "ARM Assembly", "STM32CubeIDE", "STM32F4 Discovery"],
      keyFeatures: [
        "Preemptive priority-based round-robin scheduler",
        "Custom context switching routine in ARM assembly code",
        "Semaphore and mutex implementations for thread synchronization"
      ]
    },
    {
      id: "gesture-robotic-arm",
      title: "Gesture-Controlled Robotic Arm",
      description: "A 5-DOF robotic arm controlled remotely using hand gestures captured via a webcam and translated using a MediaPipe hand tracking pipeline. Transmits command inputs to an ESP32 micro-controller.",
      technologies: ["C++", "Python", "OpenCV", "MediaPipe", "ESP32", "Servo Motors"],
      keyFeatures: [
        "Real-time extraction of hand landmarks with high accuracy",
        "Low-latency UDP communication between host machine and ESP32 controller",
        "Inverse kinematics engine resolving coordinate movements smoothly"
      ]
    }
  ],
  achievements: [
    {
      title: "First Place - Embedded Systems Hackathon",
      description: "Won first prize for developing a smart battery management system (BMS) with real-time predictive failure analysis using micro-ML models."
    },
    {
      title: "ARM Architecture Specialist Certification",
      description: "Completed advanced training in ARM Cortex-M processor architecture, memory maps, and interrupt handling."
    }
  ],
  contact: {
    email: "mithun@example.com",
    github: "https://github.com/mithun-example",
    linkedin: "https://linkedin.com/in/mithun-example",
    location: "India",
    message: "Feel free to reach out via Email, LinkedIn, or check out my work on GitHub!"
  }
};
