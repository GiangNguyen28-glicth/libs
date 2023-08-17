import { Module } from '@nestjs/common';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
