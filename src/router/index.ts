import { Router } from "express"

export const AppRouter: Router = Router()

AppRouter.use('/auths', authRouter)