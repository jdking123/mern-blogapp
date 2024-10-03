import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, cover, createdAt, author }) {
  return (
    <div className="post bg-gray-100 shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img
            src={cover}
            alt={title}
            loading="lazy"
            className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        </Link>
      </div>
      <div className="p-6">
        <Link to={`/post/${_id}`}>
          <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-300">
            {title}
          </h2>
        </Link>
        <p className="info mt-2 text-sm text-gray-500">
          <span className="author font-medium text-gray-700">
            {author?.username || 'Unknown Author'}
          </span>{" "}
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary mt-4 text-gray-700">{summary}</p>
      </div>
    </div>
  );
}
