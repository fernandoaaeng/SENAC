package br.edu.forense.wordle.resource;

import br.edu.forense.wordle.dto.GuessRequest;
import br.edu.forense.wordle.dto.GuessResponse;
import br.edu.forense.wordle.dto.SessionDetailResponse;
import br.edu.forense.wordle.dto.SessionSummaryResponse;
import br.edu.forense.wordle.dto.StartGameResponse;
import br.edu.forense.wordle.security.LoggedIn;
import br.edu.forense.wordle.security.RequestContext;
import br.edu.forense.wordle.service.GameService;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;
import org.jboss.resteasy.reactive.RestPath;

import java.util.List;

@Path("/api/game")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class GameResource {

    private final GameService gameService;
    private final RequestContext requestContext;

    @POST
    @Path("/start")
    @LoggedIn
    public StartGameResponse start() {
        return gameService.start(requestContext.getPrincipal());
    }

    /**
     * CONTRASTE com V2: este endpoint CHECA o dono da sessão.
     */
    @POST
    @Path("/{sessionId}/guess")
    @LoggedIn
    public GuessResponse guess(@RestPath Long sessionId, @Valid GuessRequest req) {
        return gameService.guess(requestContext.getPrincipal(), sessionId, req);
    }

    /**
     * V2 — IDOR: sem {@link LoggedIn} e sem checagem de dono.
     */
    @GET
    @Path("/{sessionId}")
    public SessionDetailResponse getSession(@RestPath Long sessionId) {
        return gameService.getSession(sessionId);
    }

    @GET
    @Path("/my")
    @LoggedIn
    public List<SessionSummaryResponse> mine() {
        return gameService.listMine(requestContext.getPrincipal());
    }
}
