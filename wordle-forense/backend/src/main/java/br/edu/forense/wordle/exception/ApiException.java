package br.edu.forense.wordle.exception;

import br.edu.forense.wordle.dto.ErrorResponse;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

public class ApiException extends WebApplicationException {

    public ApiException(Response.Status status, String message) {
        super(message, Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(message))
                .build());
    }

    public static ApiException badRequest(String message) {
        return new ApiException(Response.Status.BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(Response.Status.UNAUTHORIZED, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(Response.Status.FORBIDDEN, message);
    }
}
