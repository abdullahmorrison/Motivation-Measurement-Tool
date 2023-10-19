"use client"
import { useState, useEffect, useRef } from 'react'
import { DroppableProvided, DropResult } from 'react-beautiful-dnd'
import dynamic from 'next/dynamic'
const DragDropContext = dynamic(() => import("react-beautiful-dnd").then((module) => module.DragDropContext));
const Droppable = dynamic(() => import("react-beautiful-dnd").then((module) => module.Droppable));

import Scale, { ScaleType } from './components/scale/Scale'
import ConfirmModal from './components/modal/Modal'
import EditScaleModal from './components/modal/Modal'
import { createScale, deleteScale, getScales, updateScale } from '@/app/apollo-client'

import styles from './page.module.scss'

export default function Dashboard(){
    const [scales, setScales] = useState<ScaleType[]>([])
    const [username, setUsername] = useState<string>("abdullahmorrison@gmail.com")
    const [,setName] = useState<string>("Guest") //!DEFAULT "GUEST" MAY CAUSE ERRORS
    const [editScaleData, setEditScaleData] = useState<Partial<ScaleType>>()
    const [deleteScaleId, setDeleteScaleId] = useState<string>() 
    
    const goalRef = useRef<HTMLInputElement>(null);
    const avoidingFailureDescriptionRef = useRef<HTMLTextAreaElement>(null);
    const chasingSuccessDescriptionRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        async function fetchData() {
            let data: ScaleType[] = await getScales()
            data.sort((a: ScaleType, b: ScaleType) => {
                if(a.order && b.order) return a.order - b.order
                else return 0
            })
            setScales(data)
        }
        fetchData()
    }, [])


    const handleAddScale = async () => {
        const response = await createScale({
            username: username,
            goal: goalRef.current ? goalRef.current.value : "",
            avoidingFailureDescription: avoidingFailureDescriptionRef.current ? avoidingFailureDescriptionRef.current.value : "",
            chasingSuccessDescription: chasingSuccessDescriptionRef.current ? chasingSuccessDescriptionRef.current.value : ""
        })
        setScales((previousScales: ScaleType[]) => [...previousScales, response])
        setEditScaleData(undefined)
    }
    const handleEditScale = (id: string) => {
        updateScale({
            id,
            goal: goalRef.current ? goalRef.current.value : "",
            avoidingFailureDescription: avoidingFailureDescriptionRef.current ? avoidingFailureDescriptionRef.current.value : "",
            chasingSuccessDescription: chasingSuccessDescriptionRef.current ? chasingSuccessDescriptionRef.current.value : ""
        })                        
        setScales(scales.map((scale: ScaleType) => {
            if(scale.id === id) return {
                ...scale,
                goal: goalRef.current ? goalRef.current.value : "",
                avoidingFailureDescription: avoidingFailureDescriptionRef.current ? avoidingFailureDescriptionRef.current.value : "",
                chasingSuccessDescription: chasingSuccessDescriptionRef.current ? chasingSuccessDescriptionRef.current.value : ""
            }
            else return scale
        }))
        setEditScaleData(undefined)
    }
    const handleDeleteScale = async (id: string) => {
        const response = await deleteScale({id})
        setScales(scales.filter((scale: ScaleType) => scale.id !== response.id))
        setDeleteScaleId(undefined)
    }
    const handleDragAndDrop = (result: DropResult) => {
        if(!result.destination) return

        const srcI = result.source.index
        const destI = result.destination.index

        const src = scales[srcI]
        const removedSrc = scales.filter((_, index: number) => index !== srcI)

        const left = removedSrc.slice(0, destI)
        const right = removedSrc.slice(destI, removedSrc.length)

        let newScales = [...left, src, ...right]

        for(var i=0; i<newScales.length; i++) 
            if(newScales[i].id !== scales[i].id) 
                updateScale({id: newScales[i].id, order: i})
        setScales(newScales)
    }

    return (
        <>
            {deleteScaleId &&
            <ConfirmModal 
                title='Confirm Deletion'
                body={
                    <div>
                        <p>Are you sure you want to delete this scale?</p>
                    </div>
                }
                isVisible={deleteScaleId !== undefined}
                buttons={[
                    {text: 'Delete', backgroundColor: 'red', onClick:()=> handleDeleteScale(deleteScaleId)},
                    {text: 'Cancel', onClick:()=> setDeleteScaleId(undefined)}
                ]}
                onCloseModal={()=>setDeleteScaleId(undefined)}
            />}
            {editScaleData &&
            <EditScaleModal
                title='Edit Scale'
                body={
                    <div className={styles.editScaleModalBody}>
                        <fieldset>
                            <legend><h4>Goal</h4></legend>
                            <input ref={goalRef} type="text" defaultValue={editScaleData?.goal} />
                        </fieldset>
                        <fieldset>
                            <legend><h4>Avoiding Failure Description</h4></legend>
                            <textarea ref={avoidingFailureDescriptionRef} cols={30} rows={10}>{editScaleData?.avoidingFailureDescription}</textarea>
                        </fieldset> 
                        <fieldset>
                            <legend><h4>Chasing Sucess Description</h4></legend>
                            <textarea ref={chasingSuccessDescriptionRef} cols={30} rows={10}>{editScaleData?.chasingSuccessDescription}</textarea>
                        </fieldset>
                    </div>
                }
                isVisible={editScaleData !== undefined}
                buttons={[{
                    text: editScaleData.id? 'Update' : "Create", 
                    backgroundColor: '#0bf800', 
                    onClick:()=>editScaleData? (editScaleData.id? handleEditScale(editScaleData.id):handleAddScale()): undefined
                }]}
                onCloseModal={()=> setEditScaleData(undefined)} 
            />}
            <div className={styles.droppableArea}>{/**Element made to add style to the drag and drop context*/}
                <DragDropContext onDragEnd={handleDragAndDrop}>
                    <Droppable droppableId="1">
                        {(provided: DroppableProvided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                {scales.map((scale: ScaleType, i: number)=> (
                                    <Scale 
                                        index={i}
                                        key={scale.id}
                                        id={scale.id}
                                        goal={scale.goal}
                                        sliderValue={scale.sliderValue}
                                        chasingSuccessDescription={scale.chasingSuccessDescription}
                                        avoidingFailureDescription={scale.avoidingFailureDescription}
                                        onEdit={(id: string) => setEditScaleData(scales.find((scale: ScaleType) => scale.id === id))}
                                        onDelete={()=>setDeleteScaleId(scale.id)} 
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
            <button className={styles.newScale} onClick={()=>setEditScaleData({})}>+</button>
        </>
    )
}