import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class PagerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.query.size = +req.query.size || 10;
    req.query.page = +req.query.page || 1;
    next();
  }
}
