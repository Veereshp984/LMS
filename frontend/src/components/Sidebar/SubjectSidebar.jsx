import SectionItem from "./SectionItem";

export default function SubjectSidebar({ tree, subjectId, currentVideoId }) {
  if (!tree) return null;
  return (
    <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold">{tree.title}</h2>
      {tree.sections.map((section) => (
        <SectionItem
          key={section.id}
          section={section}
          subjectId={subjectId}
          currentVideoId={currentVideoId}
        />
      ))}
    </aside>
  );
}
