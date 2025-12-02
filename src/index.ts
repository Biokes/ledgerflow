import app from "./app";
import { appConfig } from "./cofig";
import logger from "./utils/logger";

app.listen(appConfig.port, () => {
    logger.info(`Server started on port ${appConfig.port}`, {
        environment: appConfig.nodeEnv
    })
})
