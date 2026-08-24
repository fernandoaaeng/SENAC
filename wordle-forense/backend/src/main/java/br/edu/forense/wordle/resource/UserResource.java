package br.edu.forense.wordle.resource;

import br.edu.forense.wordle.dto.UserPublicResponse;
import br.edu.forense.wordle.service.UserService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import org.jboss.resteasy.reactive.RestPath;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class UserResource {

    private final UserService userService;

    /** V4 — IDOR: token opcional, qualquer id sequencial. */
    @GET
    @Path("/{id}")
    public UserPublicResponse byId(@RestPath Long id) {
        return userService.byId(id);
    }
}
