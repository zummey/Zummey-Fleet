import React from "react";
import { ImageIcon } from "lucide-react";

// Placeholder tints for images without a preview URL
const TINTS = ["from-blue-100 to-blue-50", "from-pink-100 to-pink-50", "from-green-100 to-green-50"];

const AttachedImages = ({ images }) => {
  const count = images.length;

  return (
    <section aria-labelledby="incident-images-title" className="rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="incident-images-title" className="text-sm font-semibold text-[#343C6A]">
          Attached images
        </h2>
        <span className="text-xs text-gray-400">
          {count} image{count === 1 ? "" : "s"}
        </span>
      </div>

      {count === 0 ? (
        <p className="mt-4 text-xs text-gray-400">No images were attached to this incident.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-3">
          {images.map((image, i) => {
            const body = (
              <>
                {image.url ? (
                  <img src={image.url} alt="" className="h-20 w-full object-cover" />
                ) : (
                  <span
                    className={`flex h-20 w-full items-center justify-center bg-gradient-to-b ${TINTS[i % TINTS.length]} text-gray-500`}
                  >
                    <ImageIcon size={20} aria-hidden="true" />
                  </span>
                )}
                <span className="block truncate bg-white/80 px-2 py-1.5 text-[11px] text-[#343C6A]">{image.name}</span>
              </>
            );
            return (
              <li key={`${image.name}-${i}`} className="w-[120px] overflow-hidden rounded-lg border border-gray-100">
                {image.url ? (
                  <a href={image.url} target="_blank" rel="noreferrer" className="block hover:opacity-90">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default AttachedImages;
