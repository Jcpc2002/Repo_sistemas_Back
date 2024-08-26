export default class DatabaseError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.name = "DatabaseError";
        this.errorCode = errorCode;
    }
}