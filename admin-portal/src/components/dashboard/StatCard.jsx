const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = "bg-blue-500",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-6">
      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-slate-900">
            {value}
          </h2>

          <p className="text-sm mt-2 text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl ${color}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
};

export default StatCard;