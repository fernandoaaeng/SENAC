package br.edu.forense.wordle.resource;

import br.edu.forense.wordle.dto.LoginRequest;
import br.edu.forense.wordle.dto.LoginResponse;
import br.edu.forense.wordle.service.AuthService;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;

@Path("/api/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class AuthResource {

    private final AuthService authService;

    @POST
    @Path("/login")
    public LoginResponse login(@Valid LoginRequest req) {
        return authService.login(req);
    }
}
