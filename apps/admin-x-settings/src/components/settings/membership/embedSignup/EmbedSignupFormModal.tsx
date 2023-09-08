import EmbedSignupPreview from './EmbedSignupPreview';
import EmbedSignupSidebar, {SelectedLabelTypes} from './EmbedSignupSidebar';
import Modal from '../../../../admin-x-ds/global/modal/Modal';
import NiceModal from '@ebay/nice-modal-react';
import useRouting from '../../../../hooks/useRouting';
import useSettingGroup from '../../../../hooks/useSettingGroup';
import {MultiSelectOption} from '../../../../admin-x-ds/global/form/MultiSelect';
import {MultiValue} from 'react-select';
import {generateCode} from '../../../../utils/generateEmbedCode';
import {getSettingValues} from '../../../../api/settings';
import {useBrowseLabels} from '../../../../api/labels';
import {useEffect, useState} from 'react';
import {useGlobalData} from '../../../providers/GlobalDataProvider';

const EmbedSignupFormModal = NiceModal.create(() => {
    let i18nEnabled = false;

    const [selectedColor, setSelectedColor] = useState<string>('#08090c');
    const [selectedLabels, setSelectedLabels] = useState<SelectedLabelTypes[]>([]);
    const [selectedLayout, setSelectedLayout] = useState<string>('all-in-one');
    const [embedScript, setEmbedScript] = useState<string>('');
    const [isCopied, setIsCopied] = useState(false);

    const {updateRoute} = useRouting();
    const {config} = useGlobalData();
    const {localSettings, siteData} = useSettingGroup();
    const [accentColor, title, description, locale, labs, icon] = getSettingValues<string>(localSettings, ['accent_color', 'title', 'description', 'locale', 'labs', 'icon']);
    const {data: labels} = useBrowseLabels();

    if (labs) {
        i18nEnabled = JSON.parse(labs).i18n;
    }

    useEffect(() => {
        if (!siteData) {
            return;
        }
        const code = generateCode({
            preview: true,
            config: {
                blogUrl: siteData.url,
                signupForm: {
                    url: config?.signupForm?.url,
                    version: config?.signupForm?.version
                }
            },
            settings: {
                accentColor: accentColor || '#d74780',
                title: title || '',
                locale: locale || 'en',
                icon: icon || '',
                description: description || ''
            },
            labels: selectedLabels.map(({label}) => ({name: label})),
            backgroundColor: selectedColor || '#08090c',
            layout: selectedLayout,
            i18nEnabled
        });

        setEmbedScript(code);
    }, [siteData, accentColor, selectedLabels, config, title, selectedColor, selectedLayout, locale, i18nEnabled, icon, description]);

    const handleCopyClick = async () => {
        try {
            await navigator.clipboard.writeText(embedScript);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // reset after 2 seconds
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to copy text: ', err);
        }
    };

    const handleColorToggle = (e:string) => {
        setSelectedColor(e);
    };
    
    const addSelectedLabel = (selected: MultiValue<MultiSelectOption>) => {
        if (selected?.length) {
            const chosenLabels = selected?.map(({value}) => ({label: value, value: value}));
            setSelectedLabels(chosenLabels);
        } else {
            setSelectedLabels([]);
        }
    };

    return (
        <Modal
            afterClose={() => {
                updateRoute('embed-signup-form');
            }}
            cancelLabel=''
            footer={false}
            size={1120}
            testId='embed-signup-form'
            title=''
            topRightContent='close'
        >
            <div className='grid grid-cols-[5.5fr_2.5fr] gap-6 pb-8'>
                <EmbedSignupPreview
                    html={embedScript}
                    style={selectedLayout}
                />
                <EmbedSignupSidebar
                    accentColor={accentColor}
                    embedScript={embedScript}
                    handleColorToggle={handleColorToggle}
                    handleCopyClick={handleCopyClick}
                    handleLabelClick={addSelectedLabel}
                    handleLayoutSelect={setSelectedLayout}
                    isCopied={isCopied}
                    labels={labels?.labels || []}
                    selectedColor={selectedColor}
                    selectedLabels={selectedLabels}
                    selectedLayout={selectedLayout}
                />
            </div>
        </Modal>
    );
});

export default EmbedSignupFormModal;