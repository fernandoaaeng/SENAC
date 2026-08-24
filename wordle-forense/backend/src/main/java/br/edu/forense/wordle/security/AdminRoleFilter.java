package br.edu.forense.wordle.security;

import br.edu.forense.wordle.dto.ErrorResponse;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

/**
 * V3 — filtro de admin VULNERÁVEL.
 *
 * Lê a role de DENTRO do token enviado pelo cliente e NÃO consulta o banco.
 * Como o token não é assinado (TokenUtil), basta recodificar Base64 com role=ADMIN.
 *
 * Correção: JWT assinado e/ou SELECT role FROM users WHERE id = :userId.
 */
@Provider
@AdminOnly
@Priority(Priorities.AUTHORIZATION)
public class AdminRoleFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(AdminRoleFilter.class);

    @Inject
    RequestContext requestContext;

    @Override
    public void filter(ContainerRequestContext ctx) {
        if ("OPTIONS".equalsIgnoreCase(ctx.getMethod())) {
            return;
        }
        TokenUtil.Principal principal = requestContext.getPrincipal();
        if (principal == null) {
            ctx.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new ErrorResponse("token ausente"))
                    .build());
            return;
        }

        // VULNERÁVEL: confia na role do token, não na role persistida no usuário.
        if (!"ADMIN".equals(principal.role())) {
            LOG.infof("403 admin recusado (role do token=%s) userId=%s path=%s",
                    principal.role(), principal.userId(), ctx.getUriInfo().getPath());
            ctx.abortWith(Response.status(Response.Status.FORBIDDEN)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new ErrorResponse("requer role ADMIN"))
                    .build());
            return;
        }

        LOG.infof("ACESSO ADMIN (role lida do token, NAO validada no banco) userId=%s username=%s path=%s",
                principal.userId(), principal.username(), ctx.getUriInfo().getPath());
    }
}
