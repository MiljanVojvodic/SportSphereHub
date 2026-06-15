"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const home_routes_1 = __importDefault(require("./routes/home.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
const uploadsDir = path_1.default.join(__dirname, '..', 'uploads');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express_1.default.static(uploadsDir));
mongoose_1.default.connect('mongodb://127.0.0.1:27017/Projekat');
const connection = mongoose_1.default.connection;
connection.once('open', () => {
    console.log("Db connection ok");
});
const router = express_1.default.Router();
router.use("/auth", auth_routes_1.default);
router.use("/home", home_routes_1.default);
router.use("/admin", admin_routes_1.default);
app.use("/api", router);
app.listen(4000, () => console.log("Express running on port 4000!"));
