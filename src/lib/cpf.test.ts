import { describe, expect, it } from "vitest";
import { emailSintetico, formatarCpf, normalizarCpf, validarCpf } from "./cpf";

describe("normalizarCpf", () => {
  it("remove máscara e mantém só dígitos", () => {
    expect(normalizarCpf("111.444.777-35")).toBe("11144477735");
    expect(normalizarCpf(" 111 444 777 35 ")).toBe("11144477735");
  });
});

describe("validarCpf", () => {
  it("aceita CPF com dígitos verificadores corretos", () => {
    expect(validarCpf("111.444.777-35")).toBe(true);
    expect(validarCpf("52998224725")).toBe(true);
  });

  it("rejeita dígito verificador errado", () => {
    expect(validarCpf("111.444.777-36")).toBe(false);
    expect(validarCpf("52998224726")).toBe(false);
  });

  it("rejeita tamanho errado e sequências repetidas", () => {
    expect(validarCpf("123")).toBe(false);
    expect(validarCpf("00000000000")).toBe(false);
    expect(validarCpf("11111111111")).toBe(false);
  });
});

describe("formatarCpf", () => {
  it("aplica a máscara progressivamente", () => {
    expect(formatarCpf("111")).toBe("111");
    expect(formatarCpf("111444")).toBe("111.444");
    expect(formatarCpf("11144477735")).toBe("111.444.777-35");
  });
});

describe("emailSintetico", () => {
  it("gera o e-mail interno a partir do CPF normalizado", () => {
    expect(emailSintetico("111.444.777-35")).toBe("11144477735@obra.local");
  });
});
