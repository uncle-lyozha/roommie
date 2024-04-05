import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT);
    console.log("Env - " + process.env.NODE_ENV);
    console.log("Starting at port " + process.env.PORT);
    console.log("Bot token: " + process.env.BOT_TOKEN);
}
bootstrap();
