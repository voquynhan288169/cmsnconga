const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/test", (req, res) => {
    res.json({
        ok: true,
        message: "Server CMSNCONGA đang hoạt động!"
    });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});