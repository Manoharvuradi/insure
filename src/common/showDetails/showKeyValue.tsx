interface IKeyValue {
  name: string;
  value: any;
  justify?: string;
}

export default function ShowKeyValue({ name, value, justify }: IKeyValue) {
  return (
    <>
      <div
        className={` ${justify} whitespace-normal break-all py-1.5 text-base text-gray-900 `}
      >
        <span className="pr-4 text-sm font-semibold">{name} : </span>
        <span className="font-normal">{value}</span>
      </div>
    </>
  );
}
