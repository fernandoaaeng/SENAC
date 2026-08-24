package br.edu.forense.wordle.security;

import jakarta.enterprise.context.RequestScoped;
import lombok.Getter;
import lombok.Setter;

@RequestScoped
@Getter
@Setter
public class RequestContext {

    private TokenUtil.Principal principal;
}
