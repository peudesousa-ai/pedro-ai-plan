-- Seed com a situação real da obra em setembro/2026.
-- Valores em centavos.

insert into configuracoes (id, valor_contrato_centavos, data_alvo, nome_responsavel_obra)
values (true, 7182500, null, 'Responsável pela obra')
on conflict (id) do nothing;

-- Etapas do contrato original (R$ 71.825).
-- valor_rateado = true para os itens que vieram dos pacotes fechados do orçamento:
--   "Acabamento" (R$ 18.000): contrapiso, cerâmica, bancada, louças, elétrica, hidráulica
--   "Gesso liso, marcos de porta, pintura" (R$ 11.000)
insert into etapas
  (nome, grupo, valor_orcado_centavos, percentual_concluido, ordem, valor_rateado, observacao)
values
  ('Tubulões + sapata (21)', 'fundacao_estrutura', 400000, 100, 1, false, null),
  ('Blocos alicerce', 'fundacao_estrutura', 460000, 100, 2, false, null),
  ('Cintamento baixo', 'fundacao_estrutura', 400000, 100, 3, false, null),
  ('Piso grosso', 'fundacao_estrutura', 220500, 90, 4, false, null),
  ('Paredes', 'vedacao_cobertura', 500000, 100, 5, false, null),
  ('Pilares (21)', 'fundacao_estrutura', 315000, 100, 6, false, null),
  ('Cintamento superior (92 m)', 'fundacao_estrutura', 460000, 100, 7, false, null),
  ('Laje', 'fundacao_estrutura', 321000, 100, 8, false, null),
  ('Reboco externo', 'vedacao_cobertura', 600000, 50, 9, false, null),
  ('Emboço cozinha e banheiros', 'vedacao_cobertura', 306000, 100, 10, false, null),
  ('Telhado varanda', 'vedacao_cobertura', 300000, 0, 11, false,
   'Único telhado previsto no contrato. Cobertura da casa, se entrar, é aditivo.'),
  ('Contrapiso', 'acabamento', 300000, 30, 12, true, 'Rateio do pacote de acabamento (R$ 18.000)'),
  ('Cerâmica', 'acabamento', 500000, 0, 13, true, 'Rateio do pacote de acabamento (R$ 18.000)'),
  ('Bancada', 'acabamento', 150000, 0, 14, true, 'Rateio do pacote de acabamento (R$ 18.000)'),
  ('Louças (vaso e pia)', 'acabamento', 150000, 0, 15, true, 'Rateio do pacote de acabamento (R$ 18.000)'),
  ('Elétrica', 'acabamento', 350000, 0, 16, true, 'Rateio do pacote de acabamento (R$ 18.000)'),
  ('Hidráulica', 'acabamento', 350000, 30, 17, true, 'Rateio do pacote de acabamento (R$ 18.000)'),
  ('Gesso liso (teto e paredes)', 'acabamento', 700000, 0, 18, true, 'Rateio do pacote gesso/marcos/pintura (R$ 11.000)'),
  ('Marcos de porta', 'acabamento', 150000, 0, 19, true, 'Rateio do pacote gesso/marcos/pintura (R$ 11.000)'),
  ('Pintura', 'acabamento', 250000, 0, 20, true, 'Rateio do pacote gesso/marcos/pintura (R$ 11.000)');

-- Pagamentos semanais já realizados ao pedreiro (total R$ 46.605)
insert into pagamentos (data, valor_centavos, tipo, observacao) values
  ('2026-03-06', 200000, 'mao_de_obra', null),
  ('2026-03-13',  80000, 'mao_de_obra', null),
  ('2026-03-20',  40000, 'mao_de_obra', null),
  ('2026-04-03', 400000, 'mao_de_obra', null),
  ('2026-04-10', 350000, 'mao_de_obra', null),
  ('2026-04-17', 210500, 'mao_de_obra', null),
  ('2026-04-24', 320000, 'mao_de_obra', null),
  ('2026-05-01', 230000, 'mao_de_obra', null),
  ('2026-05-08', 250000, 'mao_de_obra', null),
  ('2026-05-22', 220000, 'mao_de_obra', null),
  ('2026-05-29', 220000, 'mao_de_obra', null),
  ('2026-06-05', 220000, 'mao_de_obra', null),
  ('2026-06-12', 220000, 'mao_de_obra', null),
  ('2026-06-19', 230000, 'mao_de_obra', null),
  ('2026-06-26', 300000, 'mao_de_obra', null),
  ('2026-07-03', 250000, 'mao_de_obra', null),
  ('2026-07-10', 250000, 'mao_de_obra', null),
  ('2026-07-17', 250000, 'mao_de_obra', null),
  ('2026-07-24', 210000, 'mao_de_obra', null),
  ('2026-07-31', 130000, 'mao_de_obra', 'Última semana antes da paralisação de agosto'),
  ('2026-08-22',  80000, 'mao_de_obra', 'Retomada após paralisação');

-- Materiais: único lançamento conhecido até agora
insert into materiais (data, descricao, valor_centavos, status)
values ('2026-06-12', 'Tijolos', 10000, 'comprado');
