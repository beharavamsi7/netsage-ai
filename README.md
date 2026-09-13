# NetSage AI

### AI-Assisted Cisco Network Troubleshooting and Diagnosis

NetSage AI is a web-based network troubleshooting assistant designed to help students and network administrators diagnose common Cisco networking problems.

The system takes network symptoms, notes, or Cisco command output as input and provides a structured diagnosis including the possible fault, affected OSI layer, relevant Cisco command, supporting evidence, and suggested troubleshooting steps.

NetSage AI is designed as an assistance tool. The suggested diagnosis should always be verified before applying any changes to a real network.

---

## Features

* Cisco network troubleshooting assistance
* Symptom-based fault diagnosis
* Analysis of Cisco command output
* Identification of the possible OSI layer involved
* Suggested Cisco troubleshooting commands
* Evidence-based diagnosis
* Recommended troubleshooting steps
* Structured diagnosis results
* Human verification before applying fixes
* Responsive web interface
* Interactive troubleshooting dashboard
* Mock diagnosis support for testing and demonstration
* Convex backend integration

---

## How It Works

The basic troubleshooting workflow is:

```text
Network Symptoms / Notes / Command Output
                  |
                  v
           NetSage AI Analysis
                  |
                  v
        Possible Network Fault
                  |
                  v
              OSI Layer
                  |
                  v
       Relevant Cisco Command
                  |
                  v
        Supporting Evidence
                  |
                  v
       Suggested Troubleshooting
                  |
                  v
          Human Verification
```

The system helps organize the troubleshooting process from identifying a network symptom to finding a possible cause and verifying the problem using appropriate Cisco commands.

---

## Example Use Case

### Problem

Devices connected to a switch are unable to communicate with each other, and some devices may be assigned to different VLANs.

### Input

```text
Users connected to the same switch cannot communicate.
Some devices are assigned to different VLANs.
```

### Possible Diagnosis

```text
Possible Fault:
VLAN configuration mismatch

OSI Layer:
Layer 2 - Data Link Layer

Suggested Command:
show vlan brief

Evidence:
Check whether the affected switch ports are assigned
to the correct VLAN.

Suggested Troubleshooting:
Verify VLAN assignments and check the configuration
of the affected switch ports.
```

The suggested diagnosis should be verified using the actual network configuration and command output before applying any changes.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* Framer Motion

### Backend

* Convex
* Convex Auth

### Development Tools

* Bun
* npm
* Git
* GitHub

---

## Project Architecture

```text
                    +----------------------+
                    |      User Input      |
                    | Symptoms / Notes /   |
                    | Cisco Command Output |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |      NetSage AI      |
                    |  Diagnosis Workflow  |
                    +----------+-----------+
                               |
              +----------------+----------------+
              |                |                |
              v                v                v
       Possible Fault      OSI Layer      Cisco Command
              |                |                |
              +----------------+----------------+
                               |
                               v
                    +----------------------+
                    | Evidence & Suggested |
                    |   Troubleshooting    |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |   Human Verification |
                    +----------------------+
```

---

## Project Structure

```text
netsage-ai/
|
+-- docs/
|
+-- public/
|
+-- src/
|   +-- components/
|   +-- pages/
|   +-- ...
|
+-- .env.example
+-- .gitignore
+-- package.json
+-- README.md
+-- tsconfig.json
+-- vite.config.ts
+-- ...
```

The project structure may change as new features are added.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/beharavamsi7/netsage-ai.git
```

### 2. Open the Project Directory

```bash
cd netsage-ai
```

### 3. Install Dependencies

Using Bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file based on `.env.example` and add the required backend configuration values.

Do not commit private API keys, passwords, tokens, or other sensitive credentials to the repository.

### 5. Start the Development Server

Using Bun:

```bash
bun run dev
```

Or using npm:

```bash
npm run dev
```

The application will then be available through the local development server.

---

## Network Troubleshooting Scenarios

NetSage AI can be used to assist with troubleshooting scenarios such as:

* VLAN configuration problems
* Incorrect switch port assignments
* Basic connectivity issues
* Switching-related problems
* Interface-related problems
* Incorrect network configurations
* Layer 2 troubleshooting scenarios
* Cisco command-output based diagnosis

Additional troubleshooting scenarios can be added as the project develops.

---

## Human Verification

NetSage AI is an assistance tool and should not be treated as an automatic command execution system.

Before applying any configuration change:

1. Review the suggested diagnosis.
2. Verify the relevant Cisco command output.
3. Confirm the affected device and interface.
4. Check the network topology and configuration.
5. Apply the required configuration only after verification.

This helps reduce the risk of applying an incorrect configuration based only on an automated suggestion.

---

## Current Status

The project is currently under development.

The current version focuses on:

* Cisco network troubleshooting workflow
* Structured network diagnosis
* OSI layer identification
* Cisco command suggestions
* Evidence-based troubleshooting
* Web-based dashboard
* Convex backend integration
* Mock troubleshooting scenarios

---

## Future Improvements

* Expand the troubleshooting case database
* Add more Cisco networking scenarios
* Improve diagnosis accuracy
* Add rule-based diagnosis verification
* Support more Cisco command outputs
* Add additional network device support
* Add network topology visualization
* Add troubleshooting history
* Improve diagnosis reports
* Add more advanced network troubleshooting scenarios

---

## Learning Outcomes

This project provided practical experience with:

* Computer Networks
* Cisco Networking
* OSI Model
* Network Troubleshooting
* React
* TypeScript
* Web Application Development
* Backend Integration
* Convex
* AI-assisted problem diagnosis
* Git and GitHub

---

## Project Information

| Field        | Details                             |
| ------------ | ----------------------------------- |
| Project Name | NetSage AI                          |
| Category     | Computer Networks / Web Application |
| Purpose      | Network Troubleshooting Assistance  |
| Status       | Under Development                   |
| Developer    | Behara Sai Vamsi                    |
| Frontend     | React + TypeScript + Vite           |
| Backend      | Convex                              |
| Repository   | GitHub                              |

---

## Disclaimer

NetSage AI provides troubleshooting suggestions for educational and assistance purposes.

Always verify the diagnosis, command output, network topology, and configuration before making changes to a real or production network.

---

## Author

**Behara Sai Vamsi**

CSE Student | Aspiring Data Analyst | Web & App Developer
