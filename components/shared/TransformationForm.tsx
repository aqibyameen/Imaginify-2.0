"use client";
import React, { startTransition, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  aspectRatioOptions,
  defaultValues,
  transformationTypes,
} from "@/constant";
import { CustomField } from "./CustomField";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { updateCredits } from "@/lib/database/actions/user.actions";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/database/actions/image.action";
import {useRouter}  from "next/navigation";

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({
  action,
  data = null,
  config = null,
  type,
  creditBalance,
  userId,
}: TransformationFormProps) => {
  const router=useRouter()
  const [image, setImage] = useState(data);
  const [newTransformation, setnewTransformation] =
    useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [isPending, startTransformation] = useTransition();
  const transformationType = transformationTypes[type];
  const initialValue =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValue,
  });
 async function onSubmit(values: z.infer<typeof formSchema>) {
   setIsSubmitting(true)
   if(data || image){
     const transformationUrl=getCldImageUrl({
       
       width: image?.width,
       height: image?.height,
        src:image?.publicId,
      
       ...transformationConfig,

     })
     const imageData={
      title:values.title,
       aspectRatio: values.aspectRatio,
       color: values.color,
       prompt: values.prompt,
       publicId: image?.publicId,
       transformationType: type,
       secureURL: image?.secureURL,
       transformationURL:transformationUrl,
       width: image?.width,
       height: image?.height,
       config: transformationConfig,
     
     }
     if(action == "Add"){
      try {
        const newImage=await addImage({
          image:imageData,
          userId,
          path: "/",
        })
        if(newImage){
          form.reset()
          setImage(data)
          router.push(`/translations/${newImage._id}`)
          
        }
      } catch (error) {
        console.log(error)
      }
     }
     if(action == "Update"){
      try {
        const updatedImage=await updateImage({
          image:{...imageData,_id:data._id},
          userId,
          path: `/transformation/${data._id}`
        })
        if(updatedImage){
          
          router.push(`/translations/${updatedImage._id}`)
          
        }
      } catch (error) {
        console.log(error)
      }
     }
   }
  }
  const onSelectHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];
    setImage((prev: any) => ({
      ...prev,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));
    setnewTransformation(transformationType.config);
    return onChangeField(value);
  };
  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setnewTransformation((prevState: any) => ({
        [type]: {
          ...prevState?.[type],

          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));
      return onChangeField(value);
    }, 1000);
  };

  const onTransformHandler = async() => {
    setIsTransforming(true);
    setTransformationConfig(deepMergeObjects(newTransformation, config));
    setnewTransformation(null);
    startTransition(async () => {
      await updateCredits(userId,-1)
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomField
          control={form.control} 
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />
        {type === "fill" && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  onSelectHandler(value, field.onChange)
                }
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => {
                    return (
                      <SelectItem className="select-item" key={key} value={key}>
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
        )}
        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove" ? "Object to remove" : "Object to recolor"
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={(e) =>
                    onInputChangeHandler(
                      "prompt",
                      e.target.value,
                      type,
                      field.onChange
                    )
                  }
                />
              )}
            />
            {type === "recolor" && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacment   color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler(
                        "prompt",
                        e.target.value,
                        type,
                        field.onChange
                      )
                    }
                  />
                )}
              />
            )}
          </div>
        )}
        <div className="media-uploader-field">
          <CustomField 
          control={form.control}
          name="publicId"
          className="flex size-full flex-col"
          render={({field})=>(
            <MediaUploader
            onValueChange={field.onChange}
            setImage={setImage}
            publicId={field.value}
            image={image}
            type={type}
            />

          )}
          />
          <TransformedImage
          image={image}
          type={type}
          title={form.getValues().title}
          isTransforming={isTransforming}
          setIsTransforming={setIsTransforming}
          transformationConfig={transformationConfig}
/>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? "Transforming..." : "Apply transformation"}
          </Button>
          <Button
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save Image"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
