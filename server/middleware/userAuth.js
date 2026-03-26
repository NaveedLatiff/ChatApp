import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const token = req.cookies?.token; 
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized. Please Login"
        });
    }
    
    try {
        const tokenDecode = jwt.verify(token, process.env.SESSION_SECRET);
        
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid Token. Please Login"
            });
        }
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: `Authentication Error: ${err.message}`
        });
    }
}

export default userAuth;