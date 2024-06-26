import { Box, Button, CardHeader, Divider, FormControl, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm } from 'react-hook-form';
import { VacationType } from '../../Models/VacationModel';
import { addVacation, checkLegalDates, getOneVacation, updateVacation } from "../../services/vacationsServices";
import { useEffect, useState } from "react";
import { addOneImage, getImageFile } from "../../services/imagesServices";
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import './vacationCard.css';

dayjs.extend(utc);
dayjs.extend(timezone);

interface VacationCardProps {
    isEditMode: boolean;
}

export const VacationCard = ({ isEditMode }: VacationCardProps) => {
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, reset } = useForm<VacationType>();
    const [imageSrc, setImageSrc] = useState<string>("");
    const [responseMessage, setResponseMessage] = useState<string>("");
    const [selectImage, setSelectImage] = useState<string>("Select Image");
    const [border, setBorder] = useState<string>('1px solid black');
    const [oneVacation, setOneVacation] = useState<VacationType>();
    const vacationId = useSelector((state: any) => state.currentVacation.vacationId);
    const today: Dayjs = dayjs().tz("Asia/Jerusalem");
    const minEndDate = dayjs().tz("Asia/Jerusalem").add(1, 'day');

    useEffect(() => {
        const fetchAllVacations = async () => {
            const vacation = await getOneVacation(vacationId);
            setOneVacation(vacation);
            if (isEditMode) {
                setImageSrc(`http://localhost:3001/static/images/${vacation.imageName}.jpg`);
                reset({
                    destination: vacation.destination,
                    description: vacation.description,
                    startDate: vacation.startDate,
                    endDate: vacation.endDate,
                    price: vacation.price
                });
            }
        };
        fetchAllVacations();
    }, [vacationId, isEditMode, reset]);

    const submit = async (registerForm: VacationType) => {
        try {
            if (!imageSrc) {
                setSelectImage("no image selected");
            } else {
                const vacation = {
                    "destination": registerForm.destination,
                    "description": registerForm.description,
                    "startDate": registerForm.startDate,
                    "endDate": registerForm.endDate,
                    "price": registerForm.price,
                    "imageName": registerForm.destination
                } as VacationType;
                const result = await checkLegalDates(registerForm.startDate, registerForm.endDate);
                if (result) {
                    if (isEditMode) {
                        const response = await updateVacation(vacation, vacationId);
                        if (response.status === 200) {
                            const imageFile = await getImageFile(imageSrc);
                            await addOneImage(registerForm.destination, imageFile);
                            navigate('/userpage');
                        } else {
                            setResponseMessage(response);
                        }
                    } else {
                        const response = await addVacation(vacation);
                        if (response.status === 201) {
                            const imageFile = await getImageFile(imageSrc);
                            await addOneImage(registerForm.destination, imageFile);
                            navigate('/userpage');
                        } else {
                            setResponseMessage(response);
                        }
                    }
                } else {
                    setResponseMessage("The start date cannot be later than the end date");
                }
            }
        } catch {
            console.log("error");
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        setBorder('none');
    };

    const returnToUserScreen = () => {
        navigate('/userpage');
    };

    const chengeDateFormatToIsoString = (d: dayjs.Dayjs | null, isStartDate: boolean) => {
        const inputDateString = `${d?.toDate().toLocaleString()}`;
        const date = new Date(inputDateString);
        const options: any = {
            timeZone: 'Asia/Jerusalem',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        const getPart = (type: string, defaultValue = "00") => {
            const part = parts.find(p => p.type === type);
            return part ? part.value : defaultValue;
        };

        const adjustedDateString = `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;

        const adjustedDate = new Date(adjustedDateString + "Z");

        const isoString = adjustedDate.toISOString();

        isStartDate ? setValue('startDate', isoString) : setValue('endDate', isoString);
    }

    return <section className="vacationContainer">
        <form onSubmit={handleSubmit(submit)} noValidate>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                    width: "400px",
                    height: "100%",
                    boxShadow: '3px 3px 13px 5px #153448',
                }}>
                <CardHeader sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    color: "#153448",
                }}
                    title={isEditMode ? 'Edit Vacation' : 'Add Vacation'}
                />
                <Divider variant="middle" />
                <TextField
                    id="outlined-full-width"
                    label="destination"
                    InputLabelProps={{ shrink: true }}
                    required
                    variant="outlined"
                    style={{ margin: 16 }}
                    {...register('destination', { required: true })}
                />
                <TextField
                    id="outlined-multiline-static"
                    label="description"
                    InputLabelProps={{ shrink: true }}
                    required
                    multiline
                    rows={3}
                    variant="outlined"
                    style={{ margin: 16 }}
                    {...register('description', { required: true })}
                />
                <Typography style={{
                    marginLeft: 16,
                    marginBottom: -10,
                    color: "#63625B",
                }}>
                    start on
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={isEditMode ? (oneVacation?.startDate ? dayjs(oneVacation.startDate) : null) : null}
                        minDate={today}
                        onChange={(d) => chengeDateFormatToIsoString(d, true)}
                        sx={{ m: 2, width: '28ch' }}
                    />
                </LocalizationProvider>
                <Typography style={{
                    marginLeft: 16,
                    marginBottom: -10,
                    color: "#63625B",
                }}>
                    end on
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={isEditMode ? (oneVacation?.endDate ? dayjs(oneVacation.endDate) : null) : null}
                        minDate={minEndDate}
                        onChange={(d) => chengeDateFormatToIsoString(d, false)}
                        sx={{ m: 2, width: '28ch' }}
                    />
                </LocalizationProvider>
                <FormControl style={{ margin: 16 }}>
                    <InputLabel htmlFor="outlined-adornment-amount">price</InputLabel>
                    <OutlinedInput
                        type="number"
                        id="outlined-adornment-amount"
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        label="price"
                        required
                        {...register('price', { required: true })}
                    />
                </FormControl>
                <Typography style={{
                    marginLeft: 16,
                    marginBottom: 10,
                    fontSize: 16,
                    color: "red",
                }}>
                    {responseMessage}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <div className="selectImage" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: 'center',
                        width: '200px',
                        height: '100px',
                        border: `${border}`,
                        backgroundImage: imageSrc ? `url(${imageSrc})` : 'url(http://localhost:3001/static/images/No-Image.png)',
                        backgroundSize: '200px 100px',
                        backgroundRepeat: 'no-repeat',
                    }}>
                        <label htmlFor="file-input">
                            {imageSrc ? <span className="changeImage">Change Image</span> : <span className="selectImage">{selectImage}</span>}
                            <input
                                id="file-input"
                                type="file"
                                className="filetype"
                                style={{ display: 'none' }}
                                onChange={handleFileInputChange}
                            />
                        </label>
                    </div>
                    {isEditMode ? <Button variant="contained" type="submit" sx={{ width: "250px" }}>Update</Button> :
                        <Button variant="contained" type="submit" sx={{ width: "250px" }}>Add Vacation</Button>}
                    <Button onClick={returnToUserScreen} variant="outlined" sx={{
                        width: "250px",
                        marginBottom: "10px",
                    }}>Cancel</Button>
                </Box>
            </Box>
        </form>
    </section>
}
