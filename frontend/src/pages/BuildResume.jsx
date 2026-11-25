import { useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Plus,
  Trash,
  Upload,
} from "lucide-react";
import { generateResumePDF, toBase64 } from "../utils";
import axios from "axios";
import { server } from "../main";

const blankExp = () => ({
  title: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  bullets: [""],
});

const blankEdu = () => ({
  degree: "",
  school: "",
  location: "",
  year: "",
  gpa: "",
});

const blankProj = () => ({ name: "", description: "", link: "" });

const Field = ({ label, value, onChange, placeholder, textarea }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-white/30 uppercase tracking-widest">
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="input-field resize-none"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    )}
  </div>
);

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/2 transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-white/80 capitalize">
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>
      {open && <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

const BuildResumePage = () => {
  const [mode, setMode] = useState("manual");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const [basics, setBasics] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  });

  const [summary, setSummary] = useState("");
  const [experience, setExp] = useState([blankExp()]);
  const [education, setEdu] = useState([blankEdu()]);
  const [techSkills, setTech] = useState("");
  const [softSkills, setSoft] = useState("");
  const [projects, setProjects] = useState([blankProj()]);
  const [certs, setCerts] = useState("");

  function updateExp(i, key, val) {
    setExp((p) => p.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)));
  }

  function updateBullet(ei, bi, val) {
    setExp((p) =>
      p.map((e, i) =>
        i === ei
          ? { ...e, bullets: e.bullets.map((b, j) => (j === bi ? val : b)) }
          : e,
      ),
    );
  }

  function handleFileChange(f) {
    if (f.type !== "application/pdf") {
      return setError("Please upload a PDF file.");
    }
    if (f.size > 5 * 1024 * 1024) {
      return setError("File size should be less than 5MB.");
    }

    setError("");
    setFile(f);
  }

  async function handleSubmit() {
    setError("");
    setResult(null);

    if (mode === "improve" && !file) {
      return setError("Please upload your resume PDF.");
    }

    if (mode === "manual" && !basics.name.trim()) {
      return setError("Please enter your name.");
    }

    setLoading(true);
    try {
      let payload = { mode };
      if (mode === "manual") {
        payload.formData = {
          ...basics,
          summary,
          experience,
          education,
          skills: {
            technical: techSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            soft: softSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          projects,
          certifications: certs
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
      } else {
        payload.pdfBase64 = await toBase64(file);
      }

      const { data } = await axios.post(
        `${server}/api/ai/resume-build`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to build resume");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-page min-h-screen pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Mode Switcher */}
        <div className="glass-card p-1.5 flex gap-1.5">
          {["manual", "improve"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setResult(null);
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize cursor-pointer ${
                mode === m ? "btn-primary" : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "manual"
                ? "Build from Scratch"
                : "Improve Existing Resume"}
            </button>
          ))}
        </div>

        {/* Manual Form Sections */}
        {mode === "manual" && (
          <>
            <Section title="Personal Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  value={basics.name}
                  onChange={(v) => setBasics((p) => ({ ...p, name: v }))}
                  placeholder="Mohd Ainul"
                />
                <Field
                  label="Email"
                  value={basics.email}
                  onChange={(v) => setBasics((p) => ({ ...p, email: v }))}
                  placeholder="ainul@example.com"
                />
                <Field
                  label="Phone"
                  value={basics.phone}
                  onChange={(v) => setBasics((p) => ({ ...p, phone: v }))}
                  placeholder="+91 9876543210"
                />
                <Field
                  label="Location"
                  value={basics.location}
                  onChange={(v) => setBasics((p) => ({ ...p, location: v }))}
                  placeholder="Bareilly, UP"
                />
                <Field
                  label="LinkedIn URL"
                  value={basics.linkedin}
                  onChange={(v) => setBasics((p) => ({ ...p, linkedin: v }))}
                  placeholder="linkedin.com/in/username"
                />
                <Field
                  label="Professional Summary (AI will enhance it)"
                  value={summary}
                  onChange={setSummary}
                  placeholder="Brief summary of your experience and goals..."
                  textarea
                />
              </div>
            </Section>

            <Section title="Work Experience">
              {experience.map((exp, ei) => (
                <div
                  key={ei}
                  className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Position {ei + 1}
                    </span>
                    {experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExp((p) => p.filter((_, i) => i !== ei))
                        }
                        className="text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Job Title"
                      value={exp.title}
                      onChange={(v) => updateExp(ei, "title", v)}
                      placeholder="Full Stack Developer"
                    />
                    <Field
                      label="Company"
                      value={exp.company}
                      onChange={(v) => updateExp(ei, "company", v)}
                      placeholder="Ybi Foundation"
                    />
                    <Field
                      label="Location"
                      value={exp.location}
                      onChange={(v) => updateExp(ei, "location", v)}
                      placeholder="Remote / Bareilly"
                    />
                    <Field
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v) => updateExp(ei, "startDate", v)}
                      placeholder="Feb 2026"
                    />
                    <Field
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v) => updateExp(ei, "endDate", v)}
                      placeholder="June 2026"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/30 uppercase tracking-widest">
                      Key Achievements / Responsibilities
                    </label>
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <input
                          value={b}
                          onChange={(e) => updateBullet(ei, bi, e.target.value)}
                          placeholder={`Bullet ${
                            bi + 1
                          } - start with an action verb`}
                          className="input-field flex-1"
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateExp(
                                ei,
                                "bullets",
                                exp.bullets.filter((_, j) => j !== bi),
                              )
                            }
                            className="text-red-400/50 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateExp(ei, "bullets", [...exp.bullets, ""])
                      }
                      className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
                    >
                      <Plus size={10} /> Add Bullet
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setExp((p) => [...p, blankExp()])}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
              >
                <Plus size={10} /> Add Experience
              </button>
            </Section>

            <Section title="Education">
              {education.map((edu, ei) => (
                <div
                  key={ei}
                  className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Education {ei + 1}
                    </span>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEdu((p) => p.filter((_, i) => i !== ei))
                        }
                        className="text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Degree"
                      value={edu.degree}
                      onChange={(v) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, degree: v } : e)),
                        )
                      }
                      placeholder="B.Tech CS & IT"
                    />
                    <Field
                      label="University / College"
                      value={edu.school}
                      onChange={(v) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, school: v } : e)),
                        )
                      }
                      placeholder="M.J.P. Rohilkhand University"
                    />
                    <Field
                      label="Location"
                      value={edu.location}
                      onChange={(v) =>
                        setEdu((p) =>
                          p.map((e, i) =>
                            i === ei ? { ...e, location: v } : e,
                          ),
                        )
                      }
                      placeholder="Bareilly, India"
                    />
                    <Field
                      label="Year"
                      value={edu.year}
                      onChange={(v) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, year: v } : e)),
                        )
                      }
                      placeholder="2026"
                    />
                    <Field
                      label="GPA (optional)"
                      value={edu.gpa}
                      onChange={(v) =>
                        setEdu((p) =>
                          p.map((e, i) => (i === ei ? { ...e, gpa: v } : e)),
                        )
                      }
                      placeholder="8.5/10"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setEdu((p) => [...p, blankEdu()])}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
              >
                <Plus size={10} /> Add Education
              </button>
            </Section>

            <Section title="Skills">
              <Field
                label="Technical Skills (comma separated)"
                value={techSkills}
                onChange={setTech}
                placeholder="React, Node.js, MongoDB, C++..."
              />
              <Field
                label="Soft Skills (comma separated)"
                value={softSkills}
                onChange={setSoft}
                placeholder="Leadership, Problem Solving..."
              />
            </Section>

            <Section title="Projects (Optional)">
              {projects.map((proj, pi) => (
                <div
                  key={pi}
                  className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30 uppercase tracking-widest">
                      Project {pi + 1}
                    </span>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setProjects((p) => p.filter((_, i) => i !== pi))
                        }
                        className="text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Project Name"
                      value={proj.name}
                      onChange={(v) =>
                        setProjects((p) =>
                          p.map((e, i) => (i === pi ? { ...e, name: v } : e)),
                        )
                      }
                      placeholder="CareerAI SaaS"
                    />
                    <Field
                      label="Description"
                      value={proj.description}
                      onChange={(v) =>
                        setProjects((p) =>
                          p.map((e, i) =>
                            i === pi ? { ...e, description: v } : e,
                          ),
                        )
                      }
                      placeholder="Built with React and Node.js..."
                      textarea
                    />
                    <Field
                      label="Link (optional)"
                      value={proj.link}
                      onChange={(v) =>
                        setProjects((p) =>
                          p.map((e, i) => (i === pi ? { ...e, link: v } : e)),
                        )
                      }
                      placeholder="github.com/MohdAinul/saas"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setProjects((p) => [...p, blankProj()])}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
              >
                <Plus size={10} /> Add Project
              </button>
            </Section>

            <Section title="Certifications (Optional)">
              <Field
                label="Certifications (comma separated)"
                value={certs}
                onChange={setCerts}
                placeholder="AWS Developer, Google Analytics..."
              />
            </Section>
          </>
        )}

        {/* Improve Existing PDF Mode */}
        {mode === "improve" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFileChange(f);
            }}
            onClick={() => fileRef.current?.click()}
            className="glass-card border-dashed border-white/15 flex flex-col items-center justify-center gap-3 py-10 cursor-pointer hover:border-indigo-500/40 hover:bg-white/2 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              {file ? (
                <FileText size={22} className="text-emerald-400" />
              ) : (
                <Upload size={32} className="text-indigo-400" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-white/80">
                {file ? file.name : "Drop your resume here"}
              </p>
              <p className="text-white/35 text-sm mt-0.5">
                or click to browse • PDF only • max 5MB
              </p>
            </div>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {/* Submit Button */}
        {!loading && (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText size={16} />
            {mode === "manual" ? "Build My Resume" : "Improve My Resume"}
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Building your ATS optimized resume...
            </p>
          </div>
        )}

        {/* Live Resume Preview & PDF Download */}
        {result && !loading && (
          <div className="flex flex-col gap-4">
            <div className="glass-card p-8 flex flex-col gap-5 font-mono text-sm">
              <div className="border-b border-white/8 pb-5">
                <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/40 text-xs">
                  {[
                    result.email,
                    result.phone,
                    result.location,
                    result.linkedin,
                  ]
                    .filter(Boolean)
                    .map((v, i) => (
                      <span key={i}>{v}</span>
                    ))}
                </div>
              </div>

              {result.summary && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                    Summary
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}

              {result.experience?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Experience
                  </p>
                  {result.experience.map((e, i) => (
                    <div className="mb-4" key={i}>
                      <div className="flex justify-between flex-wrap gap-1">
                        <span className="font-semibold text-white/80">
                          {e.title} • {e.company}
                        </span>
                        <span className="text-white/35 text-xs">
                          {e.startDate} • {e.endDate}
                        </span>
                      </div>
                      <ul className="mt-1.5 flex flex-col gap-1 pl-3">
                        {e.bullets.filter(Boolean).map((b, j) => (
                          <li
                            key={j}
                            className="text-white/50 text-xs before:content-['-'] before:mr-2"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {result.education?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Education
                  </p>
                  {result.education.map((e, i) => (
                    <div
                      key={i}
                      className="flex justify-between flex-wrap gap-1 mb-2"
                    >
                      <span className="text-white/70 font-medium">
                        {e.degree} • {e.school}
                      </span>
                      <span className="text-white/35 text-xs">
                        {e.year} {e.gpa ? ` • GPA ${e.gpa}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(result.skills?.technical?.length > 0 ||
                result.skills?.soft?.length > 0) && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Skills
                  </p>
                  {result.skills.technical?.length > 0 && (
                    <p className="text-white/55 text-xs mb-1">
                      <span className="text-white/40 font-semibold">
                        Technical:{" "}
                      </span>
                      {result.skills.technical.join(", ")}
                    </p>
                  )}
                  {result.skills.soft?.length > 0 && (
                    <p className="text-white/55 text-xs mb-1">
                      <span className="text-white/40 font-semibold">
                        Soft:{" "}
                      </span>
                      {result.skills.soft.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {result.projects?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Projects
                  </p>
                  {result.projects.map((p, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-white/70 font-semibold">
                        {p.name}
                        {p.link && (
                          <span className="text-indigo-400 ml-2 text-xs font-normal">
                            {p.link}
                          </span>
                        )}
                      </p>
                      <p className="text-white/45 text-xs mt-1">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.certifications?.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.certifications.map((c, i) => (
                      <span key={i} className="feature-pill">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => generateResumePDF(result)}
              className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildResumePage;
