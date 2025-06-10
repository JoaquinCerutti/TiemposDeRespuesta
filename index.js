const axios = require('axios');
const { performance } = require('perf_hooks');
require('dotenv').config();

const models = [
  { nombre: "GPT-4o", model: "gpt-4o" },
  { nombre: "GPT-4 Turbo", model: "gpt-4-turbo" }
];

const repeticiones = 3;

async function medirTiempo(modelo) {
  let tiempos = [];

  for (let i = 0; i < repeticiones; i++) {
    const inicio = performance.now();
    try {
      await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: modelo,
          messages: [{ role: "user", content: "¿Cuál es la capital de Francia?" }],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error(`✖ ${modelo} - Error: ${error.response?.data?.error?.message || error.message}`);
      continue;
    }
    const fin = performance.now();
    tiempos.push(fin - inicio);
  }

  const promedio = tiempos.length
    ? (tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
    : NaN;

  return promedio;
}

async function main() {
  const fs = require('fs');
  const resultados = [];

  console.log("Midiendo tiempos de respuesta GPT-4o y GPT-4 Turbo...\n");

  for (const { nombre, model } of models) {
    const promedio = await medirTiempo(model);
    if (!isNaN(promedio)) {
      console.log(`→ ${nombre} - Tiempo Promedio: ${promedio.toFixed(2)} ms`);
    }
    resultados.push(`${nombre},${isNaN(promedio) ? 'ERROR' : promedio.toFixed(2)} ms`);
  }

  fs.writeFileSync('resultados.csv', 'Modelo,Tiempo Promedio\n' + resultados.join('\n'));
  console.log("\n✅ Resultados guardados en 'resultados.csv'");
}

main();
