import { Router } from "express";

const router = Router();
let ready = false;

const setReadiness = (value) => {
    ready = Boolean(value);
};

router.get("/", (req, res) =>
    res.json({
        success: true,
        status: "ok",
    })
);

router.get("/live", (req, res) =>
    res.json({
        success: true,
        status: "alive",
    })
);

router.get("/ready", (req, res) => {
    if (!ready) {
        return res.status(503).json({
            success: false,
            status: "not_ready",
        });
    }

    return res.json({
        success: true,
        status: "ready",
    });
});

export { setReadiness };
export default router;
