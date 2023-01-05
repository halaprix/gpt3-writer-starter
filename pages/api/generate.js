import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix =
  "Please number lines of the code snippet provided below and mark posible Solidity gas optimizations with comments - 'potential gas optimization' and 'no optimization': \n";
const generateAction = async (req, res) => {
  const baseCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}${req.body.userInput}`,
    temperature: 0.7,
    max_tokens: 250,
  });

  const basePromptOutput = baseCompletion.data.choices.pop();
  console.log("first output", basePromptOutput.text);
  const secondPrompt = `
  TTake the initial code and code divided by lines and give gas optimizations for solidity code marked with 'potential gas optimization' comment. Make a report in a format : 'code line number - proposed optimization'. Don't just propose optimization. Go deep into each one. Explain why. Format the answer with html tags. \n

  Initial code: ${req.body.userInput}

  Code divided by lines: ${basePromptOutput.text}

  Optimization for lines marked with "potential gas optimization" :
  `;

  // I call the OpenAI API a second time with Prompt #2
  const secondPromptCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${secondPrompt}`,
    // I set a higher temperature for this one. Up to you!
    temperature: 0.85,
    // I also increase max_tokens.
    max_tokens: 1250,
  });

  // Get the output
  const secondPromptOutput = secondPromptCompletion.data.choices.pop();
  console.log("second output", secondPromptOutput.text);
  // Send over the Prompt #2's output to our UI instead of Prompt #1's.
  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;
