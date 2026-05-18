import styles from "./LoadingSpinner.module.css";

type Props = {
  size?: number;
  label?: string;
};

export default function LoadingSpinner({ size = 48, label = "Memuat data..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <svg
        className={styles.spinner}
        width={size}
        height={size}
        viewBox="0 0 66 66"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={styles.path}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          cx="33"
          cy="33"
          r="30"
        />
      </svg>
      {label && (
        <p className="text-sm text-gray-400">{label}</p>
      )}
    </div>
  );
}
