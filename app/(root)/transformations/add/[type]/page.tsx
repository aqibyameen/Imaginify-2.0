import Header from '@/components/shared/Header'
import React from 'react'
import { transformationTypes } from '@/constant'
import TransformationForm from '@/components/shared/TransformationForm'
import { auth } from '@clerk/nextjs/server'
import { getUserById } from '@/lib/database/actions/user.actions'
import { redirect } from 'next/navigation'


const AddTransformationPage = async({param}:SearchParamProps) => {
  
  const {type}=  param || {}
  
  const {userId} =await auth();
  console.log(userId)
  
  if (!userId)  redirect('/sign-up');
    
  
      
  
  const transformation=transformationTypes[type]
  const user = await  getUserById(userId)
  console.log(user)
  return (
    <>
  <Header title={transformation?.title} subTitle={transformation?.subTitle} />
  <section className='mt-10'>
  <TransformationForm action='Add'
      userId={user._id} type={transformation?.type as TransformationTypeKey} creditBalance={user.creditBalance}  />
   </section>
    </>

  )
}

export default AddTransformationPage
