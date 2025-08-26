import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SelectWithLabel = ({ data, selected, onChange, label, placeholder, disabled, className, wrapperClass, error, isError,required}: any) => {
    return (<div className={"flex flex-col " + wrapperClass}>
        {
            label && <label htmlFor="financialYear" className="block text-md font-medium mb-2" >
                {label}{required && <span className="text-red-500">&nbsp;*</span>}
            </label>
        }
         <Select disabled={disabled} value={selected} onValueChange={(value: string) => onChange(value)}>
            <SelectTrigger className={`w-[11.25rem] border border-[#d9d9d9] focus-within:outline-[#300976] hover:border-[#d9d9d9] ${className}`} aria-label={label?label:"Dropdown"}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white">
                <SelectGroup>
                    {/* {data.map((row:any) => (<SelectItem value={row.value}>{row.label}</SelectItem>))} */}
                    {(data.length > 0) && data?.map((row:any, idx:number) => (<SelectItem value={row.value} key={idx} className="custom-select-item">{row.label}</SelectItem>))}
                </SelectGroup>
            </SelectContent>
        </Select>
        {isError && <p className={`text-sm font-[500] text-red-500 mt-1 text-end lg:h-3 md:h-4 h-6`}>{error ? error : ""}</p>}
    </div>);
};

export default SelectWithLabel;
