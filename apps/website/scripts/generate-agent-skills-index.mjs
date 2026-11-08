import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const skillsRoot = path.join(root, 'public', '.well-known', 'agent-skills');
const site = 'https://www.energy-horizon.net';

const skills = [
  {
    name: 'discover-services',
    description:
      'Discover Energy Horizon industrial services in Iraq (drilling, hydraulic, electrical, PPE, manpower, procurement). Use when a user asks what Energy Horizon supplies or which service lines are available.',
  },
  {
    name: 'discover-brands',
    description:
      'Discover brands and manufacturers represented by Energy Horizon. Use when a user asks which brands, OEM lines, or product partners Energy Horizon carries in Iraq.',
  },
  {
    name: 'explore-projects',
    description:
      'Explore Energy Horizon project references and field work in Iraq. Use when a user asks for experience, case studies, manpower deployments, or completed project evidence.',
  },
];

async function main() {
  const entries = [];

  for (const skill of skills) {
    const rel = path.join(skill.name, 'SKILL.md');
    const filePath = path.join(skillsRoot, rel);
    const bytes = await fs.readFile(filePath);
    const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
    entries.push({
      name: skill.name,
      type: 'skill-md',
      description: skill.description,
      url: `${site}/.well-known/agent-skills/${skill.name}/SKILL.md`,
      digest,
    });
  }

  const index = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: entries,
  };

  const out = path.join(skillsRoot, 'index.json');
  await fs.writeFile(out, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${out}`);
  for (const e of entries) console.log(`  ${e.name} ${e.digest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
