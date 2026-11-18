function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function getRelevantContext(query, knowledge) {
  const search = ` ${normalize(query)} `;
  const mentions = (...terms) => terms.some(term => search.includes(` ${normalize(term)} `));
  const sections = [];
  const add = (label, value) => sections.push(`${label}:\n${JSON.stringify(value, null, 2)}`);

  const projects = knowledge.projects.filter(project => mentions(project.title, ...project.aliases));
  const publicProject = ({ aliases, ...project }) => project;
  if (projects.length) {
    add('Matching projects', projects.map(publicProject));
  } else if (mentions('projects', 'project', 'build', 'built', 'portfolio', 'recent work', 'latest work')) {
    add('Projects', knowledge.projects.map(publicProject));
  }

  if (mentions('mithun', 'who is', 'about you', 'bio', 'background', 'hello', 'hi')) {
    add('Personal info', knowledge.personal);
  }
  if (mentions('education', 'degree', 'college', 'university', 'study', 'student', 'course', 'vit')) {
    add('Education', knowledge.education);
  }
  if (mentions('skills', 'skill', 'technologies', 'technology', 'stack', 'languages', 'tools', 'programming', 'firmware', 'embedded', 'fpga', 'rf', 'vlsi', 'pcb', 'vivado', 'cst', 'openems', 'kicad', 'python', 'opencv')) {
    add('Skills', knowledge.skills);
  }
  if (mentions('experience', 'internship', 'internships', 'intern', 'career', 'work experience', 'worked', 'akvosphere', 'medxai', 'ieee', 'shaurya')) {
    add('Experience', knowledge.experience);
  }
  if (mentions('achievement', 'achievements', 'hackathon', 'sih', 'shaastra', 'certifications', 'certificate', 'awards', 'won')) {
    add('Achievements', knowledge.achievements);
  }
  if (mentions('contact', 'email', 'github', 'linkedin', 'hire', 'reach', 'social', 'repository', 'repo')) {
    add('Contact', knowledge.contact);
  }

  if (!sections.length) {
    add('Personal info', knowledge.personal);
    add('Available portfolio topics', ['Education', 'Skills', 'Projects', 'Experience', 'Achievements', 'Contact']);
  }
  return sections.join('\n\n');
}
