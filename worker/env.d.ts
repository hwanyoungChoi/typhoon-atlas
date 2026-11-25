// cloudflare:workers 의 env 에 실리는 바인딩. .openai/hosting.json 에 d1 이 있을 때만 주입된다.
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
  }
}
