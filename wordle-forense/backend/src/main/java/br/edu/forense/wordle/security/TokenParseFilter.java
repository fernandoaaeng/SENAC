package br.edu.forense.wordle.security;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class TokenParseFilter implements ContainerRequestFilter {

    @Inject
    RequestContext requestContext;

    @Override
    public void filter(ContainerRequestContext ctx) {
        TokenUtil.parse(ctx.getHeaderString("Authorization"))
                .ifPresent(requestContext::setPrincipal);
    }
}
