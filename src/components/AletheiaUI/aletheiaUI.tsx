import styles from './aletheiaUI.module.css';
import {useState} from 'react';
import axios from 'axios';

function AletheiaUI() {
	const [activeTab, setActiveTab] = useState(0);
	const [profile, setProfile] = useState<Record<string, unknown> | undefined>(undefined);
	const [structuredOutput, setStructuredOutput] = useState(false);
	const [structuredSchema, setStructuredSchema] = useState('');
    const [sessionId, setSessionId] = useState('');

	const fetchProfile = async ()  => {
		try {
			const response = await axios.get<Record<string, string>>('http://localhost:4001/v1/profile', {
				params: {
					sessionId: sessionId,
					...(structuredOutput ? {} : {verbosity: 5}),
                    ...(structuredOutput ? {schema: structuredSchema} : {})
				},
			});
			setProfile(response.data);
		} catch (error) {
			console.error('Error fetching profile:', error);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.tabSelector}>
				<button
					type='button'
					className={`${styles.tab} ${activeTab === 0 ? styles.activeTab : ''}`}
					onClick={() => {
						setActiveTab(0);
					}}
				>Profile
				</button>
				<button
					type='button'
					className={`${styles.tab} ${activeTab === 1 ? styles.activeTab : ''}`} onClick={() => {
						setActiveTab(1);
					}}
				>Settings
				</button>

			</div>
			<div className={styles.content}>
				{activeTab === 0
					? (<>
                    {structuredOutput && profile ? <>
                    {Object.entries(profile).map(([key, value]) => (
                        <div key={key}>
                            <strong>{key}:</strong> {typeof value === "string" ? value : JSON.stringify(value)}
                        </div>
                    ))}
                    </> :  <div>{profile?.summary && typeof profile?.summary === "string" ? profile.summary : JSON.stringify(profile?.summary)}</div>}
						<button
							type='button'
							className={styles.btn}
							onClick={async () => fetchProfile()}
						>Fetch profile
						</button>
					</>
					)
					: <>
                        <input value={sessionId} onChange={(e) => {
                            setSessionId(e.target.value);
                        }} placeholder={"aletheiaSessionId"}></input>
						<div><input
							checked={structuredOutput}
							id='structured'
							type='checkbox'
							onChange={e => {
                                setProfile(undefined)
								setStructuredOutput(e.target.checked);
							}}/>
						<label htmlFor='structured'>Structured output</label>
						</div>
						{structuredOutput
							? <textarea
								className={styles.textArea}
								placeholder='{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "sex": { "type": "string", "enum": ["M", "F", "U"] },
    "age_range": {
      "type": "array",
      "items": { "type": "integer" },
      "minItems": 2,
      "maxItems": 2
    },
    "mood": {
      "type": "string",
      "enum": ["apathetic", "interested", "excited", "undecided", "bored"]
    }
  },
  "required": ["sex", "age_range", "mood"]
}' value={structuredSchema} onChange={e => {
									setStructuredSchema(e.target.value);
								}}/>
							: null}
					</>}
			</div>
		</div>
	);
}

export default AletheiaUI;
