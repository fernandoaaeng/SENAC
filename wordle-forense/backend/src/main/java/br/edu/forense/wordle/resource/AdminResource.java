package br.edu.forense.wordle.resource;

import br.edu.forense.wordle.dto.UserPublicResponse;
import br.edu.forense.wordle.dto.WordRequest;
import br.edu.forense.wordle.dto.WordResponse;
import br.edu.forense.wordle.security.AdminOnly;
import br.edu.forense.wordle.security.LoggedIn;
import br.edu.forense.wordle.service.AdminService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.List;

/**
 * V3 — rotas que "deveriam" ser só ADMIN.
 * {@link AdminOnly} dispara o filtro que lê a role do token (adulterável).
 */
@Path("/api/admin")
@LoggedIn
@AdminOnly
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class AdminResource {

    private final AdminService adminService;

    @GET
    @Path("/users")
    public List<UserPublicResponse> users() {
        return adminService.listUsers();
    }

    @GET
    @Path("/words")
    public List<WordResponse> words() {
        return adminService.listWords();
    }

    @POST
    @Path("/words")
    public RestResponse<WordResponse> create(WordRequest req) {
        return RestResponse.status(RestResponse.Status.CREATED, adminService.createWord(req));
    }

    @PUT
    @Path("/words/{id}")
    public WordResponse update(@RestPath Long id, WordRequest req) {
        return adminService.updateWord(id, req);
    }

    @DELETE
    @Path("/words/{id}")
    public RestResponse<Void> delete(@RestPath Long id) {
        adminService.deleteWord(id);
        return RestResponse.noContent();
    }
}
