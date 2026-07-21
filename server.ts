import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware for API endpoints
  app.use(express.json());

  // Paths for data files
  const dataDir = path.join(process.cwd(), "src", "data");
  const configPath = path.join(dataDir, "config.json");
  const messagesPath = path.join(dataDir, "messages.json");
  const newsletterPath = path.join(dataDir, "newsletter.json");
  const donationsPath = path.join(dataDir, "donations.json");

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Ensure messages.json exists
  if (!fs.existsSync(messagesPath)) {
    fs.writeFileSync(messagesPath, JSON.stringify([], null, 2), "utf8");
  }

  // Ensure newsletter.json exists
  if (!fs.existsSync(newsletterPath)) {
    fs.writeFileSync(newsletterPath, JSON.stringify([], null, 2), "utf8");
  }

  // Ensure donations.json exists
  if (!fs.existsSync(donationsPath)) {
    fs.writeFileSync(donationsPath, JSON.stringify([], null, 2), "utf8");
  }

  // Serve uploaded assets statically
  const assetsDir = path.join(process.cwd(), "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  app.use("/assets", express.static(assetsDir));

  // API: Get Site Config
  app.get("/api/config", (req, res) => {
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf8");
        const parsed = JSON.parse(raw);
        // Do not expose admin credentials to public GET request
        const { adminCredentials, ...publicConfig } = parsed;
        res.json(publicConfig);
      } else {
        res.status(404).json({ error: "Config file not found" });
      }
    } catch (err: any) {
      console.error("Error reading config.json:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API: Update Site Config (Protected by basic token validation)
  app.post("/api/config", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (!fs.existsSync(configPath)) {
        return res.status(404).json({ error: "Config file not found" });
      }

      const raw = fs.readFileSync(configPath, "utf8");
      const currentConfig = JSON.parse(raw);

      // Merge incoming updates (except credentials which should be updated separately or merged carefully)
      const updatedConfig = {
        ...currentConfig,
        ...req.body,
        // Preserve credentials if they are not explicitly sent
        adminCredentials: req.body.adminCredentials || currentConfig.adminCredentials
      };

      fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), "utf8");
      
      // Exclude admin credentials from response
      const { adminCredentials, ...publicConfig } = updatedConfig;
      res.json({ success: true, config: publicConfig });
    } catch (err: any) {
      console.error("Error writing config.json:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API: Admin Login
  app.post("/api/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
      }

      let adminCredentials = { username: "admin", password: "admin123" };

      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.adminCredentials) {
          adminCredentials = parsed.adminCredentials;
        }
      }

      if (username === adminCredentials.username && password === adminCredentials.password) {
        // Return a mock token for frontend local validation
        return res.json({
          success: true,
          token: "session-token-fundacion-2026",
          user: { username }
        });
      } else {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
    } catch (err: any) {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // API: Save Contact Form Submission
  app.post("/api/contact", (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
      }

      let messages = [];
      if (fs.existsSync(messagesPath)) {
        const raw = fs.readFileSync(messagesPath, "utf8");
        messages = JSON.parse(raw);
      }

      const newMessage = {
        id: "msg-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      };

      messages.unshift(newMessage); // Add to the top
      fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), "utf8");

      res.json({ success: true, message: "Mensaje recibido correctamente" });
    } catch (err: any) {
      console.error("Error saving contact message:", err);
      res.status(500).json({ error: "Error al enviar el mensaje" });
    }
  });

  // API: Get Received Messages (Protected)
  app.get("/api/messages", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (fs.existsSync(messagesPath)) {
        const raw = fs.readFileSync(messagesPath, "utf8");
        const messages = JSON.parse(raw);
        res.json(messages);
      } else {
        res.json([]);
      }
    } catch (err: any) {
      console.error("Error reading messages:", err);
      res.status(500).json({ error: "Error al leer los mensajes" });
    }
  });

  // API: Delete Received Message (Protected)
  app.delete("/api/messages/:id", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      const { id } = req.params;
      if (fs.existsSync(messagesPath)) {
        const raw = fs.readFileSync(messagesPath, "utf8");
        const messages = JSON.parse(raw);
        const filtered = messages.filter((msg: any) => msg.id !== id);
        fs.writeFileSync(messagesPath, JSON.stringify(filtered, null, 2), "utf8");
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Mensaje no encontrado" });
      }
    } catch (err: any) {
      console.error("Error deleting message:", err);
      res.status(500).json({ error: "Error al eliminar el mensaje" });
    }
  });

  // API: Confirm SINPE / Bank Donation
  app.post("/api/donations/confirm", (req, res) => {
    try {
      const { name, email, phone, amount, channel, reference, voucherImage } = req.body;
      if (!name || !email || !amount) {
        return res.status(400).json({ error: "Nombre, correo y monto son obligatorios." });
      }

      let donations = [];
      if (fs.existsSync(donationsPath)) {
        const raw = fs.readFileSync(donationsPath, "utf8");
        donations = JSON.parse(raw);
      }

      const newDonation = {
        id: "don-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        name,
        email,
        phone,
        amount: parseFloat(amount),
        channel,
        reference: reference || "",
        voucherImage: voucherImage || null,
        status: "pending", // pending verification by default
        createdAt: new Date().toISOString()
      };

      donations.unshift(newDonation);
      fs.writeFileSync(donationsPath, JSON.stringify(donations, null, 2), "utf8");

      res.json({ success: true, message: "Reporte de donación recibido" });
    } catch (err: any) {
      console.error("Error saving donation confirmation:", err);
      res.status(500).json({ error: "Error al registrar el reporte de donación" });
    }
  });

  // API: Get Received Donations (Protected)
  app.get("/api/donations", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (fs.existsSync(donationsPath)) {
        const raw = fs.readFileSync(donationsPath, "utf8");
        const donations = JSON.parse(raw);
        res.json(donations);
      } else {
        res.json([]);
      }
    } catch (err: any) {
      console.error("Error reading donations:", err);
      res.status(500).json({ error: "Error al leer los reportes de donación" });
    }
  });

  // API: Update Donation Status (Protected)
  app.put("/api/donations/:id/status", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      const { id } = req.params;
      const { status } = req.body; // 'approved' | 'rejected' | 'pending'

      if (fs.existsSync(donationsPath)) {
        const raw = fs.readFileSync(donationsPath, "utf8");
        const donations = JSON.parse(raw);
        const donationIdx = donations.findIndex((d: any) => d.id === id);
        if (donationIdx !== -1) {
          donations[donationIdx].status = status;
          fs.writeFileSync(donationsPath, JSON.stringify(donations, null, 2), "utf8");
          res.json({ success: true, donation: donations[donationIdx] });
        } else {
          res.status(404).json({ error: "Reporte de donación no encontrado" });
        }
      } else {
        res.status(404).json({ error: "Reportes de donaciones no existentes" });
      }
    } catch (err: any) {
      console.error("Error updating donation status:", err);
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  });

  // API: Newsletter Subscribe
  app.post("/api/newsletter/subscribe", (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Correo electrónico no válido" });
      }

      let subscribers = [];
      if (fs.existsSync(newsletterPath)) {
        const raw = fs.readFileSync(newsletterPath, "utf8");
        subscribers = JSON.parse(raw);
      }

      // Avoid duplicates
      const exists = subscribers.some((sub: any) => sub.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.json({ success: true, message: "¡Ya te encuentras suscrito al newsletter!" });
      }

      const newSubscriber = {
        id: "sub-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        email: email.trim(),
        createdAt: new Date().toISOString()
      };

      subscribers.unshift(newSubscriber);
      fs.writeFileSync(newsletterPath, JSON.stringify(subscribers, null, 2), "utf8");

      res.json({ success: true, message: "¡Suscripción exitosa al newsletter!" });
    } catch (err: any) {
      console.error("Error saving newsletter subscriber:", err);
      res.status(500).json({ error: "Error al procesar la suscripción" });
    }
  });

  // API: Get Newsletter Subscribers (Protected)
  app.get("/api/newsletter/subscribers", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      if (fs.existsSync(newsletterPath)) {
        const raw = fs.readFileSync(newsletterPath, "utf8");
        const subscribers = JSON.parse(raw);
        res.json(subscribers);
      } else {
        res.json([]);
      }
    } catch (err: any) {
      console.error("Error reading newsletter subscribers:", err);
      res.status(500).json({ error: "Error al leer suscriptores" });
    }
  });

  // API: Delete Newsletter Subscriber (Protected)
  app.delete("/api/newsletter/subscribers/:id", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      const { id } = req.params;
      if (fs.existsSync(newsletterPath)) {
        const raw = fs.readFileSync(newsletterPath, "utf8");
        const subscribers = JSON.parse(raw);
        const filtered = subscribers.filter((sub: any) => sub.id !== id);
        fs.writeFileSync(newsletterPath, JSON.stringify(filtered, null, 2), "utf8");
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Suscriptor no encontrado" });
      }
    } catch (err: any) {
      console.error("Error deleting newsletter subscriber:", err);
      res.status(500).json({ error: "Error al eliminar el suscriptor" });
    }
  });

  // API: Base64 File Upload (Protected)
  app.post("/api/upload", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== "Bearer session-token-fundacion-2026") {
        return res.status(401).json({ error: "No autorizado" });
      }

      const { filename, base64 } = req.body;
      if (!filename || !base64) {
        return res.status(400).json({ error: "Nombre de archivo y base64 son requeridos" });
      }

      // Extract raw base64 data (strip off prefix like "data:image/png;base64,")
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let rawData = base64;
      if (matches && matches.length === 3) {
        rawData = matches[2];
      }

      const buffer = Buffer.from(rawData, "base64");
      
      // Ensure folder exists
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const filePath = path.join(assetsDir, filename);
      fs.writeFileSync(filePath, buffer);

      res.json({ success: true, url: `/assets/${filename}` });
    } catch (err: any) {
      console.error("Error in api/upload:", err);
      res.status(500).json({ error: "Error al guardar el archivo" });
    }
  });

  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support SPA routing - serve index.html for any unhandled routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
