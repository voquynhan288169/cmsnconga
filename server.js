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

async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS site_data (
            id INTEGER PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    console.log("Đã kiểm tra bảng site_data");
}

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

app.get("/api/site-data", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT data FROM site_data WHERE id = 1"
        );

        if (result.rows.length === 0) {
            return res.json({
                ok: true,
                data: null
            });
        }

        res.json({
            ok: true,
            data: result.rows[0].data
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            ok: false,
            message: "Không lấy được dữ liệu website"
        });
    }
});

app.put("/api/site-data", async (req, res) => {
    try {
        const data = req.body;

        if (!data || typeof data !== "object") {
            return res.status(400).json({
                ok: false,
                message: "Dữ liệu không hợp lệ"
            });
        }

        await pool.query(
            `
            INSERT INTO site_data (id, data, updated_at)
            VALUES (1, $1::jsonb, NOW())
            ON CONFLICT (id)
            DO UPDATE SET
                data = EXCLUDED.data,
                updated_at = NOW()
            `,
            [JSON.stringify(data)]
        );

        res.json({
            ok: true,
            message: "Đã lưu dữ liệu lên PostgreSQL"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            ok: false,
            message: "Không lưu được dữ liệu"
        });
    }
});

async function startServer() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Không thể khởi tạo PostgreSQL:", error);
        process.exit(1);
    }
}

startServer();