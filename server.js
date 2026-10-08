const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.json({ limit: "50mb" }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/test", (req, res) => {
    res.json({
        ok: true,
        message: "Server CMSNCONGA đang hoạt động!"
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            ok: true,
            message: "Đã kết nối PostgreSQL!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: "Không kết nối được PostgreSQL"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});