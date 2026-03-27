import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    // 1. Try to get token from Cookies
    // 2. If no cookie, try to get it from the 'Authorization' header (Bearer Token)
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]; 
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized. Please Login"
        });
    }
    
    try {
        const tokenDecode = jwt.verify(token, process.env.SESSION_SECRET);
        
        if (tokenDecode && tokenDecode.id) {
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