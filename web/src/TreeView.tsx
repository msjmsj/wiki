import type { Category, ConceptEntry, Keyword, Leaf } from "./types";
import { clusterCategory, leafAnchor } from "./util";
import { Tag } from "./Tag";

/** 分化树视图:大类 → 性质家族 → 子性质 → 叶子 */
export function TreeView({
  categories,
  concepts,
}: {
  categories: Category[];
  concepts: Record<string, ConceptEntry>;
}) {
  return (
    <div className="poster">
      {categories.map((cat) => (
        <CategoryCol key={cat.id} cat={cat} concepts={concepts} />
      ))}
    </div>
  );
}

function CategoryCol({
  cat,
  concepts,
}: {
  cat: Category;
  concepts: Record<string, ConceptEntry>;
}) {
  const families = clusterCategory(cat, concepts);
  return (
    <section className="col" id={cat.id}>
      <h2>{cat.title}</h2>
      <p className="sub">{cat.subtitle}</p>
      {families.map((fam, i) => (
        <FamilyBlock key={fam.rootId ?? i} fam={fam} cat={cat} concepts={concepts} />
      ))}
    </section>
  );
}

function FamilyBlock({
  fam,
  cat,
  concepts,
}: {
  fam: ReturnType<typeof clusterCategory>[number];
  cat: Category;
  concepts: Record<string, ConceptEntry>;
}) {
  const famHead = fam.rootId ? (
    <h4>
      <Tag kw={fam.rootId} concepts={concepts} cls="tag fam" />
    </h4>
  ) : null;
  // 家族只有一类且就是根概念本身 → 单层;否则根为家族头,子类缩进一级
  const flat =
    fam.clusters.length === 1 && fam.clusters[0].tagId === fam.rootId;

  if (flat || !fam.rootId) {
    return (
      <div className="fam">
        {famHead}
        <ul className="leaves">
          {fam.clusters[0].items.map(({ leaf, index }) => (
            <LeafRow
              key={index}
              leaf={leaf}
              concepts={concepts}
              anchor={leafAnchor(cat, leaf, index)}
              visibleTags={fam.clusters[0].tagId ? (leaf.tags ?? []).slice(1) : (leaf.tags ?? [])}
            />
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="fam">
      {famHead}
      {fam.clusters.map((c, i) => (
        <div className="cluster" key={c.tagId ?? i}>
          {c.tagId && c.tagId !== fam.rootId && (
            <h5>
              <Tag kw={c.tagId} concepts={concepts} cls="tag" />
            </h5>
          )}
          <ul className="leaves">
            {c.items.map(({ leaf, index }) => (
              <LeafRow
                key={index}
                leaf={leaf}
                concepts={concepts}
                anchor={leafAnchor(cat, leaf, index)}
                visibleTags={c.tagId ? (leaf.tags ?? []).slice(1) : (leaf.tags ?? [])}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LeafRow({
  leaf,
  concepts,
  anchor,
  visibleTags,
}: {
  leaf: Leaf;
  concepts: Record<string, ConceptEntry>;
  anchor: string;
  visibleTags: Keyword[];
}) {
  return (
    <li id={anchor}>
      {leaf.symptomNote ? (
        <span className="sym more" tabIndex={0} data-detail={leaf.symptomNote}>
          {leaf.symptom}
        </span>
      ) : (
        <span className="sym">{leaf.symptom}</span>
      )}
      {visibleTags.map((t, i) => (
        <Tag key={i} kw={t} concepts={concepts} cls="tag" />
      ))}
      {leaf.xref && (
        <a className="xref" href={leaf.xref.target}>
          {leaf.xref.text}
        </a>
      )}
      <span className="arrow">→</span>
      {leaf.keywords.map((kw, i) => (
        <Tag key={i} kw={kw} concepts={concepts} cls="kw" />
      ))}
      {leaf.warning && (
        <span className="tip" data-tip={leaf.warning}>
          ⚠︎
        </span>
      )}
    </li>
  );
}
