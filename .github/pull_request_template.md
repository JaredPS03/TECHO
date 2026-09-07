## ¿Qué cambia?

<!-- Una o dos frases. Qué hace este PR y por qué. -->

## Tipo de cambio

- [ ] 🐛 Corrección de bug
- [ ] ✨ Nueva funcionalidad
- [ ] 🔒 Seguridad
- [ ] ⚡ Rendimiento
- [ ] ♻️ Refactor (sin cambio de comportamiento)
- [ ] 📚 Documentación
- [ ] ⚙️ Infraestructura / CI

## Contexto

<!-- Por qué se hace así y qué alternativas se descartaron.
     Si cierra un issue: Closes #123 -->

## Cómo probarlo

1.
2.
3.

## Checklist

- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm build` compila correctamente
- [ ] No hay credenciales, contraseñas ni `.env` en el diff
- [ ] Si toqué el esquema, actualicé `database.sql` y [`docs/DATABASE.md`](../docs/DATABASE.md)
- [ ] Si toqué la API, actualicé [`docs/API.md`](../docs/API.md)
- [ ] Si añadí un endpoint de administración, llama a `isAdmin()` antes de tocar datos
- [ ] Los errores 500 no devuelven detalles internos al cliente

## Capturas

<!-- Si el cambio se ve, muéstralo. Antes / después si aplica. -->
