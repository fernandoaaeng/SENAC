package br.edu.forense.wordle.resource;

import br.edu.forense.wordle.dto.ActiveWordResponse;
import br.edu.forense.wordle.service.AdminService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Path("/api/words")
@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class WordResource {

    private final AdminService adminService;

    @GET
    public List<ActiveWordResponse> active() {
        return adminService.listActiveWords();
    }
}
