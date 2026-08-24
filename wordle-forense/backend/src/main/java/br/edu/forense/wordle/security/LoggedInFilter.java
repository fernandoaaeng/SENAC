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

@Provider
@LoggedIn
@Priority(Priorities.AUTHENTICATION + 1)
public class LoggedInFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(LoggedInFilter.class);

    @Inject
    RequestContext requestContext;

    @Override
    public void filter(ContainerRequestContext ctx) {
        if ("OPTIONS".equalsIgnoreCase(ctx.getMethod())) {
            return;
        }
        if (requestContext.getPrincipal() != null) {
            return;
        }
        LOG.debugf("401 sem token em %s %s", ctx.getMethod(), ctx.getUriInfo().getPath());
        ctx.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse("token ausente ou invalido"))
                .build());
    }
}
