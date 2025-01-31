<h1 align="center">
  🏥 3D Medical Image Analysis - Frontend 🏥
</h1>

<p align="center">
  <i>A modern React-based frontend for 3D medical image visualization and segmentation.</i>
</p>

<div align="center">

  <img src="https://img.shields.io/badge/React-16.12.0-blue?style=flat-square" alt="React 16.12.0" />
  <img src="https://img.shields.io/badge/Material--UI-5.x-green?style=flat-square" alt="Material UI" />
  <img src="https://img.shields.io/badge/VTK.js-3D%20Rendering-orange?style=flat-square" alt="VTK.js" />
  <img src="https://img.shields.io/badge/Firebase-Authentication-yellow?style=flat-square" alt="Firebase" />
  <img src="https://img.shields.io/badge/WebSockets-Real--time-red?style=flat-square" alt="WebSockets" />

</div>

---

## 🌟 Overview

This **ReactJS-based frontend** provides an intuitive interface for **3D medical image visualization and segmentation**. It integrates with a **Flask backend** that processes **DICOM and NIfTI scans**, applies **deep learning segmentation**, and returns structured medical insights.

### 🔹 Key Features:
- **Interactive 3D Medical Image Viewer** – Uses **VTK.js** for advanced visualization.
- **Material-UI-based UI** – Provides a clean, accessible, and modern design.
- **Secure Authentication** – Uses **Firebase Auth** for user authentication and session management.
- **Real-time Updates** – Uses **Socket.IO** for live status updates on image processing.
- **Drag & Drop File Upload** – Supports **DICOM/NIfTI** file uploads via **react-dropzone**.
- **Image Processing Tools** – Includes contrast adjustment, segmentation overlays, and labeling.

---

## 🏗️ Tech Stack

| **Technology**  | **Purpose** |
|-----------------|------------|
| **React (16.12.0)** | Frontend framework |
| **Material-UI (MUI)** | UI components & styling |
| **VTK.js** | 3D medical image rendering |
| **Firebase** | Authentication & cloud storage |
| **Socket.IO** | Real-time communication with backend |
| **Axios** | API requests & data fetching |
| **React Router** | Client-side navigation |

---

## 🛠️ Setup & Installation

### 🔹 Prerequisites
- **Node.js 16+**
- **Yarn or npm**
- **Firebase Project (for authentication)**
- **Backend API (running Flask server)**

### 🔹 Clone the Repository
```bash
git clone https://github.com/Gideon-777/Frontend_ChestOmx.git
cd Frontend_ChestOmx
```

### 🔹 Install Dependencies
Using **Yarn**:
```bash
yarn install
```
Or using **npm**:
```bash
npm install
```

### 🔹 Configure Firebase
- Create a **Firebase Project** at [Firebase Console](https://console.firebase.google.com).
- Enable **Email/Password Authentication**.
- Copy your **Firebase config object** and place it in `src/firebaseConfig.js`:
  ```javascript
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  export default firebaseConfig;
  ```

### 🔹 Start the Development Server
```bash
yarn start
```
or
```bash
npm start
```

The app will now be running on **[http://localhost:3000](http://localhost:3000)**.

---

## 📡 API Communication

The frontend interacts with the backend **Flask API** through **Axios**. Below are key API requests:

| **Method** | **Endpoint** | **Description** |
|------------|-------------|-----------------|
| `POST` | `/api/token` | Authenticate user & retrieve JWT token |
| `POST` | `/api/prediction/upload` | Upload a DICOM/NIfTI scan |
| `POST` | `/api/prediction/inference` | Start AI-based segmentation |
| `GET`  | `/api/image/<img_id>/<slice_id>` | Retrieve a specific image slice |
| `GET`  | `/api/models` | Get available segmentation models |

---

## 🎨 UI & Components

### **Main Components:**
- **`Login.js`** – Handles user authentication.
- **`Dashboard.js`** – Displays patient records & segmentation results.
- **`ImageViewer.js`** – Renders 3D medical images using **VTK.js**.
- **`FileUpload.js`** – Allows users to upload DICOM/NIfTI files.
- **`Sidebar.js`** – Navigation panel for different features.

---

## 📞 Contact  
For questions or feedback, feel free to reach out via:  
✉️ **Email:** mengaraaxel@gmail.com 
🔗 **GitHub:** [Author](https://github.com/Gideon-777)  

---
