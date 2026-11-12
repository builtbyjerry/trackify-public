import { createContext, useState, useEffect, useCallback } from 'react'
import { getInitialSession, signIn, signOut, subscribeToAuthChanges } from '../api/auth'
import { getEmployeeByUserId } from '../api/employee'
import { getUserProfile } from '../api/profile'
import { getOnboardingStatus } from '../services/onboardingService'
import { errorLog, log } from '../utils/loggers.js';
import { registerEmployee } from '../services/authService.js';

export const UserContext = createContext()

export function UserProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [authChecked, setAuthChecked] = useState(false)
    const [employee, setEmployee] = useState(null)
    const [error, setError] = useState(null)
    const [onboardingStatus, setOnboardingStatus] = useState(null)

    const ONBOARDING_STATUS = {
        PROFILE_PENDING: 'PROFILE_PENDING',
        PIN_PENDING: 'PIN_PENDING',
        COMPLETED: 'COMPLETED'
    }

    const login = async (email, password) => {
        setAuthChecked(false)
        setError(null)
        try {
            await signIn(email, password)
            setAuthChecked(true)
        } catch (error) {
            setError(error.message)
            // errorLog("Failed to log in:", error.message)
            throw error
        } finally {
            setAuthChecked(true)
        }
    }

    const signup = async (email, password, firstName, lastName, phoneNo) => {
        setAuthChecked(false)
        setError(null)
        try {
            const { defaultedEmployee, defaultedProfile } = await registerEmployee(email, password, firstName, lastName, phoneNo)
            log("New default employee added:", defaultedEmployee)
            log("New default profile added:", defaultedProfile)
            setAuthChecked(true)

            setEmployee({
                ...defaultedEmployee,
                ...defaultedProfile,
                name: `${defaultedProfile?.first_name ?? ''} ${defaultedProfile?.last_name ?? ''}`.trim() || 'User',
                imageVersion: Date.now()
            })
            log("Employee set at fetch employee: ", employee)
        } catch (error) {
            setError(error.message)
            log("Failed to sign up:", error.message)
            throw error
        }
    }

    const logout = async () => {
        try {
            await signOut()
        } catch (error) {
            setError(error.message)
            errorLog("Failed to sign out:", error.message)
            throw error
        }
    }

    // Managing onboarding state
    const updateOnboardingStatus = useCallback(async () => {
        if (!user) {
            setOnboardingStatus(null)
            return
        }

        try {
            const profile = await getUserProfile(user.id)        
            const status = getOnboardingStatus(profile)
            setOnboardingStatus(status)
            
        } catch (err) {
            errorLog('Error fetching onboarding status:', err)
            setOnboardingStatus(ONBOARDING_STATUS.PROFILE_PENDING) // Very questionable??
        }
    }, [user])

    const updateEmployee = (updates) => {

        setEmployee(prev => {
            if (!prev) return prev
            return { ...prev, ...updates }
        })
        log('[updateEmployee] profile_url:', updates) 
    }

    useEffect(() => {
        updateOnboardingStatus()
    }, [user])

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const initialSession = await getInitialSession() 
                setSession(initialSession)
                setUser(initialSession?.user ?? null)
            } catch (error) {
                errorLog('Error getting initial session:', error)
                setUser(null)
            } finally {
                setAuthChecked(true)
            }
        }

        initializeAuth()

        const subscription = subscribeToAuthChanges((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setAuthChecked(true)
        })

        return () => subscription.unsubscribe()
    }, [])


    const fetchEmployee = async () => {
        try {
            console.log("userId:", user?.id)
            const profile = await getUserProfile(user?.id)
            // profile doesn't exist yet — happens during signup race condition
            // just wait, the next user state change will re-trigger this
            if (!profile) {
                log('Profile not ready yet, skipping fetch')
                return
            }
            
            const employeeData = await getEmployeeByUserId(user?.id)
            
            if (!employeeData) {
                log('Employee not ready yet, skipping fetch')
                return
            }

            setEmployee({
                ...profile,
                ...employeeData,
                name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'User',
                imageVersion: Date.now()
            })
        } catch (error) {
            errorLog("Error fetching employee:", error)
            setEmployee(null)
        }
    }
    useEffect(() => {
        log("Employee changed:", employee)
    }, [employee])


    useEffect(() => {
        if (!user) {
            setEmployee(null)
            return
        }
        
        fetchEmployee()
        
    }, [user])

    return (
        <UserContext.Provider value={{
            user,
            session,
            authChecked,
            onboardingStatus,
            ONBOARDING_STATUS,
            employee,
            error,
            login, 
            signup,
            logout,
            updateOnboardingStatus,
            updateEmployee,
        }}>
            {children}
        </UserContext.Provider>
    )
}