import { useContext } from "react";
import { TransactionSessionContext } from "../contexts/TransactionSessionContext.jsx";

export function useTransactionSession() {
    const context = useContext(TransactionSessionContext)

    if (!context) {
        throw new Error("useTransactionSession must be used within a TransactionSessionProvider component.")
    }
    return context
}